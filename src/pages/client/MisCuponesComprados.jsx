import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import CuponCard from '../../components/ui/CuponCard'
import { useAuth } from '../../context/AuthContext'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  mainContainer: { margin: '0 auto', width: '100%' },
  header: { backgroundColor: '#002147', padding: 20, borderTopLeftRadius: 8, borderTopRightRadius: 8, flexDirection: 'row', justifyContent: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerHighlight: { color: '#22d3ee', fontSize: 24, fontWeight: 'bold' },
  body: { backgroundColor: '#f8fafc', padding: 30, borderWidth: 1, borderColor: '#e2e8f0', borderTopWidth: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  h2: { color: '#002147', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  p: { color: '#475569', fontSize: 12, marginBottom: 20, lineHeight: 1.5 },
  couponBox: { backgroundColor: 'white', borderWidth: 2, borderColor: '#007BA7', borderStyle: 'dashed', borderRadius: 8, padding: 20, alignItems: 'center', marginBottom: 20 },
  label: { color: '#64748b', fontSize: 10, marginBottom: 4 },
  offerTitle: { color: '#002147', fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  code: { color: '#007BA7', fontSize: 26, fontWeight: 'bold', letterSpacing: 3, marginBottom: 16 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoLabel: { color: '#64748b', fontSize: 12 },
  infoValue: { color: '#002147', fontSize: 12, fontWeight: 'bold' },
  disclaimer: { color: '#475569', fontSize: 11, textAlign: 'center', lineHeight: 1.5 },
  footer: { borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 20, paddingTop: 15 },
  footerText: { color: '#94a3b8', fontSize: 10, textAlign: 'center' }
})

const CuponDocument = ({ cupon, oferta }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sivar</Text>
          <Text style={styles.headerHighlight}>Cuponera</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.h2}>¡Aquí tienes tu cupón!</Text>
          <Text style={styles.p}>Tu cupón para {oferta?.companies?.name || 'Empresa Asociada'} está listo para ser utilizado.</Text>

          <View style={styles.couponBox}>
            <Text style={styles.label}>OFERTA</Text>
            <Text style={styles.offerTitle}>{oferta?.title || 'Cupón'}</Text>

            <Text style={styles.label}>TU CÓDIGO DE CUPÓN</Text>
            <Text style={styles.code}>{cupon?.code}</Text>

            <View style={styles.rowInfo}>
              <Text style={styles.infoLabel}>Precio pagado: </Text>
              <Text style={styles.infoValue}>${oferta?.offer_price || '0.00'}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.infoLabel}>Válido hasta: </Text>
              <Text style={styles.infoValue}>{(oferta?.coupon_expiry_date || oferta?.end_date) ? new Date(oferta.coupon_expiry_date || oferta.end_date).toLocaleDateString('es-ES') : 'N/D'}</Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>Presenta este código en la tienda para canjearlo. Guárdalo como respaldo.</Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© {new Date().getFullYear()} SivarCuponera · San Salvador, El Salvador</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
)

export default function MisCuponesComprados() {
  const [cupones, setCupones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('vigente')
  const { session } = useAuth()

  const normalizarEstado = (estado) => {
    const est = (estado || '').toString().trim().toLowerCase()
    if (['redeemed', 'usado', 'canjeado'].includes(est)) return 'usado'
    if (['expired', 'vencido'].includes(est)) return 'vencido'
    return 'vigente'
  }

  useEffect(() => {
    if (session?.user) {
      cargarCupones()
    }
  }, [session])

  const cargarCupones = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('coupons')
        .select(`
          *,
          offers (*)
        `)
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const cuponesObtenidos = data || []
      const companyIds = [...new Set(
        cuponesObtenidos
          .map((c) => {
            const offer = Array.isArray(c.offers) ? c.offers[0] : (c.offers || {})
            return offer.company_id
          })
          .filter(Boolean)
      )]

      let mapaEmpresas = {}
      if (companyIds.length > 0) {
        const { data: companiesData } = await supabase
          .from('companies_public')
          .select('id, name')
          .in('id', companyIds)
        
        if (companiesData) {
          companiesData.forEach(emp => {
            mapaEmpresas[String(emp.id)] = emp.name || 'Empresa Asociada'
          })
        }
      }

      const cuponesFinales = cuponesObtenidos.map((cupon) => {
        const offer = Array.isArray(cupon.offers) ? cupon.offers[0] : (cupon.offers || {})
        const cid = offer.company_id ? String(offer.company_id) : null
        return {
          ...cupon,
          offer: {
            ...offer,
            companies: { name: mapaEmpresas[cid] || 'Empresa Asociada' },
          },
        }
      })

      setCupones(cuponesFinales)
    } catch (error) {
      console.error('Error cargando cupones:', error)
    } finally {
      setLoading(false)
    }
  }

  const cuponesFiltrados = filtro === 'todos' 
    ? cupones 
    : cupones.filter(c => normalizarEstado(c.status) === filtro)

  if (loading) return <div className="p-8 text-center">Cargando...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-oxford-navy mb-6">Mis Cupones</h1>

      <div className="flex gap-3 mb-6">
        {['todos', 'vigente', 'usado', 'vencido'].map(f => (
          <button 
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${filtro === f ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            {f === 'vigente' ? 'Disponibles' : f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cuponesFiltrados.map((cupon) => (
          <div key={cupon.id} className="flex flex-col">
            <CuponCard
              cupon={{
                estado: normalizarEstado(cupon.status),
                codigo_cupon: cupon.code,
                offer: {
                  title: cupon.offer?.title,
                  image: cupon.offer?.image_url,
                  companyName: cupon.offer?.companies?.name || 'Empresa Asociada',
                  description: cupon.offer?.description,
                  expiryDate: cupon.offer?.coupon_expiry_date || cupon.offer?.end_date,
                },
              }}
            />
            {normalizarEstado(cupon.status) === 'vigente' && (
              <div className="mt-4">
                <PDFDownloadLink
                  document={<CuponDocument cupon={cupon} oferta={cupon.offer || {}} />}
                  fileName={`cupon-${cupon.code}.pdf`}
                  className="w-full inline-block text-center px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold"
                >
                  Descargar Cupón en PDF
                </PDFDownloadLink>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}