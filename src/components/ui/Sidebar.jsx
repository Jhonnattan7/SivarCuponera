import { useState, useEffect } from 'react'
import { obtenerRubros } from '../../utils/api'

export default function Sidebar({ rubroSeleccionado, onSeleccionarRubro }) {
  const [rubros, setRubros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarRubros()
  }, [])

  const cargarRubros = async () => {
    try {
      const resultado = await obtenerRubros()
      
      if (resultado.success) {
        setRubros(resultado.data)
      } else {
        setError(resultado.error)
      }
    } catch (error) {
      console.error('Error cargando rubros:', error)
      setError('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <aside className="w-full lg:w-64 shrink-0 mb-6 lg:mb-0">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="font-bold text-oxford-navy mb-4">Categorías</h3>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </aside>
    )
  }

  if (error) {
    return (
      <aside className="w-full lg:w-64 shrink-0 mb-6 lg:mb-0">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="font-bold text-oxford-navy mb-4">Categorías</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={cargarRubros}
            className="mt-2 px-3 py-1 bg-primary text-white text-sm rounded hover:bg-[#005f87] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-full lg:w-64 shrink-0 mb-6 lg:mb-0">
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm sticky top-4">
        <h3 className="font-bold text-oxford-navy mb-4">Categorías</h3>
        
        {rubros.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay categorías disponibles</p>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => onSeleccionarRubro(null)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                rubroSeleccionado === null
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-300 hover:shadow-sm'
              }`}
            >
              Todas
            </button>
            
            {rubros.map((rubro) => (
              <button
                key={rubro.id}
                onClick={() => onSeleccionarRubro(rubro.name)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                  rubroSeleccionado === rubro.name
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-300 hover:shadow-sm'
                }`}
              >
                {rubro.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}