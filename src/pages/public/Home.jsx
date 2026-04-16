import { useState } from 'react'
import Hero from '../../components/ui/Hero'
import Sidebar from '../../components/ui/Sidebar'
import OfertasCuadricula from '../../components/ui/OfertasCuadricula'

export default function Home() {
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  return (
    <>
      <section id="ofertas">
        <Hero busqueda={busqueda} setBusqueda={setBusqueda} />
      </section>

      <section id="categorias" className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar
            rubroSeleccionado={rubroSeleccionado}
            onSeleccionarRubro={setRubroSeleccionado}
          />
          <div id="como-funciona" className="w-full">
            <OfertasCuadricula
              rubroSeleccionado={rubroSeleccionado}
              busqueda={busqueda}
            />
          </div>
        </div>
      </section>

      <section id="beneficios" className="sr-only" aria-hidden="true" />
      <section id="precios" className="sr-only" aria-hidden="true" />
      <section id="contacto" className="sr-only" aria-hidden="true" />
    </>
  )
}