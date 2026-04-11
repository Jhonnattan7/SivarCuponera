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
        {/* Encabezado oscuro */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sivar</Text>
          <Text style={styles.headerHighlight}>Cuponera</Text>
        </View>

        {/* Cuerpo del PDF */}
        <View style={styles.body}>
          <Text style={styles.h2}>¡Aquí tienes tu cupón!</Text>
          <Text style={styles.p}>Tu cupón para Empresa Asociada está listo para ser utilizado.</Text>

          {/* Caja principal del cupón con borde punteado */}
          <View style={styles.couponBox}>
            <Text style={styles.label}>OFERTA</Text>
            <Text style={styles.offerTitle}>{oferta.title || 'Cupón'}</Text>

            <Text style={styles.label}>TU CÓDIGO DE CUPÓN</Text>
            <Text style={styles.code}>{cupon.code}</Text>

            <View style={styles.rowInfo}>
              <Text style={styles.infoLabel}>Precio pagado: </Text>
              <Text style={styles.infoValue}>${oferta.offer_price || '0.00'}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.infoLabel}>Válido hasta: </Text>
              <Text style={styles.infoValue}>{(oferta.coupon_expiry_date || oferta.end_date) ? new Date(oferta.coupon_expiry_date || oferta.end_date).toLocaleDateString('es-ES') : 'N/D'}</Text>
            </View>
          </View>

          <Text style={styles.disclaimer}>Presenta este código en la tienda para canjearlo. Guárdalo como respaldo.</Text>

          {/* Pie de página */}
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
  const [errorMsg, setErrorMsg] = useState(null)
  const { session } = useAuth()

 
  const normalizarEstado = (estado) => {
    const est = (estado || '').toString().trim().toLowerCase()
  
    if (['available', 'active', 'disponible', 'paid', 'pagado', 'vigente', ''].includes(est)) return 'vigente'
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
      setErrorMsg(null)
      // Verificamos que tengamos el ID del usuario actual
      if (!session?.user?.id) {
        console.warn('No se encontró el ID del usuario.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('coupons')
        .select(`
          *,
          offers (*)
        `)
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      
      //console.log('Datos cargados de Supabase:', data);

      setCupones(data || [])
    } catch (error) {
      console.error('Error al cargar cupones:', error)
      setErrorMsg(error.message || "Error desconocido al cargar cupones")
    } finally {
      setLoading(false)
    }
  }

  const cuponesFiltrados = filtro === 'todos' 
    ? cupones 
    : cupones.filter(c => normalizarEstado(c.status) === filtro)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-center text-slate-600">Cargando tus cupones...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-oxford-navy mb-6">Mis Cupones</h1>

      {/* Caja de error visual para depuración */}
      {errorMsg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
          <p className="font-bold">Error de Supabase:</p>
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === 'todos'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('vigente')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === 'vigente'
              ? 'bg-primary text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Disponibles
        </button>
        <button
          onClick={() => setFiltro('usado')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === 'usado'
              ? 'bg-primary text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Usados
        </button>
        <button
          onClick={() => setFiltro('vencido')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === 'vencido'
              ? 'bg-primary text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Vencidos
        </button>
      </div>

      {cuponesFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg">
            No tienes cupones {filtro}s
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cuponesFiltrados.map((cupon) => (
            <div key={cupon.id} className="flex flex-col">
              <CuponCard
                
                cupon={{
                  estado: normalizarEstado(cupon.status),
                  codigo_cupon: cupon.code,
                  Cupones: { 
                    titulo: cupon.offers?.title,
                    imagen: cupon.offers?.IMG,
                    Tienda: 'Empresa Asociada',
                    descripcion: cupon.offers?.description,
                    fecha_fin: cupon.offers?.coupon_expiry_date || cupon.offers?.end_date,
                  },
                }}
              />
              {(filtro === 'vigente' || filtro === 'todos') && cupon.code && normalizarEstado(cupon.status) === 'vigente' && (
                <div className="mt-4 flex justify-center">
                  <PDFDownloadLink
                    document={<CuponDocument cupon={cupon} oferta={cupon.offers || {}} />}
                    fileName={`cupon-${cupon.code}.pdf`}
                    className="w-full text-center px-6 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-opacity-90 transition-colors text-sm font-semibold"
                  >
                    {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar Cupón en PDF')}
                  </PDFDownloadLink>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}