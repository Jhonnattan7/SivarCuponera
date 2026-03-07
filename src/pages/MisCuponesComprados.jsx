import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import CuponCard from '../components/cupones/CuponCard'
import Layout from '../components/layout/Layout'

export default function MisCuponesComprados() {
  const [cupones, setCupones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('disponible')

  useEffect(() => {
    cargarCupones()
  }, [])

  const cargarCupones = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('CuponesComprados')
        .select(`
          *,
          Cupones (
            titulo,
            Tienda,
            descripcion,
            imagen,
            fecha_fin
          )
        `)
        .eq('id', user.id)
        .order('fecha_compra', { ascending: false })

      if (error) throw error

      setCupones(data || [])
    } catch (error) {
      console.error('Error al cargar cupones:', error)
    } finally {
      setLoading(false)
    }
  }

  const cuponesFiltrados = cupones.filter(c => c.estado === filtro)

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-center text-slate-600">Cargando tus cupones...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-oxford-navy mb-6">Mis Cupones</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setFiltro('Vigente')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === 'Vigente'
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
            <CuponCard key={cupon.id_cupones} cupon={cupon} />
          ))}
        </div>
      )}
      </div>
    </Layout>
  )
}