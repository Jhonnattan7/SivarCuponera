import { useState } from 'react'
import Hero from '../../components/ui/Hero'
import Sidebar from '../../components/ui/Sidebar'
import OfertasCuadricula from '../../components/ui/OfertasCuadricula'

export default function Home() {
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  return (
    <>
      <Hero busqueda={busqueda} setBusqueda={setBusqueda} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar
            rubroSeleccionado={rubroSeleccionado}
            onSeleccionarRubro={setRubroSeleccionado}
          />
          <OfertasCuadricula
            rubroSeleccionado={rubroSeleccionado}
            busqueda={busqueda}
          />
        </div>
      </div>
    </>
  )
}