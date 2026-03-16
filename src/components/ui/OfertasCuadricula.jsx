import { useState, useEffect } from 'react'
import { obtenerOfertasActivas, calcularDescuento } from "../../utils/api";
import OfertaCard from './OfertaCard'

export default function OfertasCuadricula({ rubroSeleccionado, busqueda }) {
  const [ofertas, setOfertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ordenamiento, setOrdenamiento] = useState('recientes')

  useEffect(() => {
    cargarOfertas()
  }, [rubroSeleccionado, busqueda])


  const cargarOfertas = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Cargando ofertas - Categoría:', rubroSeleccionado, 'Búsqueda:', busqueda)

      const resultado = await obtenerOfertasActivas(rubroSeleccionado)

      if (resultado.success) {
        let ofertasFiltradas = resultado.data

        if (busqueda) {
          const busquedaLower = busqueda.toLowerCase()
          ofertasFiltradas = ofertasFiltradas.filter(oferta =>
            oferta.Tienda?.toLowerCase().includes(busquedaLower) ||
            oferta.titulo?.toLowerCase().includes(busquedaLower) ||
            oferta.descripcion?.toLowerCase().includes(busquedaLower)
          )
        }

        console.log('Ofertas filtradas:', ofertasFiltradas)
        setOfertas(ofertasFiltradas)
      } else {
        setError(resultado.error)
      }
    } catch (err) {
      setError('Error al cargar las ofertas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const obtenerOfertasOrdenadas = () => {
    let ofertasOrdenadas = [...ofertas]

    if (busqueda) {
      const termino = busqueda.toLowerCase()
      ofertasOrdenadas = ofertasOrdenadas.filter((oferta) => {
        const titulo = oferta.titulo || ''
        const marca = oferta.Tienda || ''
        return titulo.toLowerCase().includes(termino) || marca.toLowerCase().includes(termino)
      })
    }

    switch (ordenamiento) {
      case 'recientes':
        ofertasOrdenadas.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
        break
      case 'descuento':
        ofertasOrdenadas.sort((a, b) => {
          const descuentoA = calcularDescuento(a.precio_regular, a.precio_oferta)
          const descuentoB = calcularDescuento(b.precio_regular, b.precio_oferta)
          return descuentoB - descuentoA
        })
        break
      case 'populares':
        ofertasOrdenadas.sort((a, b) => (b.cantidad_cupon || 0) - (a.cantidad_cupon || 0))
        break
      default:
        break
    }

    return ofertasOrdenadas
  }

  if (loading) {
    return (
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-oxford-navy">Mejores Ofertas para Ti</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-full sm:w-32 h-32 bg-slate-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 w-full space-y-3">
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium mb-2">Error al cargar las ofertas</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={cargarOfertas}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#005f87] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const ofertasOrdenadas = obtenerOfertasOrdenadas()

  return (
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-oxford-navy">
          Mejores Ofertas para Ti
          {ofertas.length > 0 && (
            <span className="text-slate-500 font-normal text-base ml-2">
              ({ofertas.length})
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="recientes">Más Recientes</option>
            <option value="descuento">Mayor Descuento</option>
            <option value="populares">Más Populares</option>
          </select>
        </div>
      </div>

      {ofertasOrdenadas.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
          <h3 className="text-xl font-bold text-slate-700 mb-2">No hay ofertas disponibles</h3>
          <p className="text-slate-500">
            {rubroSeleccionado
              ? 'No hay ofertas en esta categoría en este momento.'
              : 'No hay ofertas activas en este momento.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {ofertasOrdenadas.map((oferta) => (
            <OfertaCard key={oferta.id_cupones} oferta={oferta} />
          ))}
        </div>
      )}
    </div>
  )
}