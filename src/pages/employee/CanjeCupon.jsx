import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import Layout from '../../components/ui/Layout'
import { useAuth } from '../../context/AuthContext'

export default function CanjeCupon() {
  const { profile } = useAuth()
  const [codigo, setCodigo] = useState('')
  const [dui, setDui] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)
  const [nombreEmpresa, setNombreEmpresa] = useState('')

  useEffect(() => {
    const fetchEmpresa = async () => {
      if (profile?.company_id) {
        const { data } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single()
        
        if (data) {
          setNombreEmpresa(data.name || data.company_name || 'Tu Empresa')
        }
      }
    }
    fetchEmpresa()
  }, [profile])

  const handleCanje = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMensaje(null)

    try {
      if (!codigo || !dui) {
        throw new Error('Por favor, ingresa el código del cupón y el DUI del cliente.')
      }

      const { data: cliente } = await supabase
        .from('profiles')
        .select('id')
        .eq('dui', dui.trim())
        .maybeSingle()

      if (!cliente) {
        throw new Error('No se encontró ningún cliente registrado con este DUI.')
      }

      const { data, error: fetchError } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', codigo.trim())
        .maybeSingle()

      if (fetchError) {
        throw new Error('No se pudo consultar el cupón. Intenta nuevamente.')
      }

      if (!data) {
        throw new Error('El código de cupón no existe o no pertenece a tu empresa.')
      }

      if (data.client_id !== cliente.id) {
        throw new Error('El cupón es válido, pero no le pertenece al cliente con este DUI.')
      }

      const estadoActual = (data.status || '').toLowerCase()
      if (estadoActual !== 'available') {
        throw new Error(`Este cupón no puede ser canjeado. Estado actual: ${data.status.toUpperCase()}`)
      }

      const { error: updateError } = await supabase
        .from('coupons')
        .update({ 
          status: 'redeemed', 
          redeemed_at: new Date().toISOString(),
          redeemed_by: profile?.id 
        })
        .eq('id', data.id)

      if (updateError) {
        throw new Error('Ocurrió un error al actualizar el estado del cupón.')
      }

      setMensaje('¡El cupón ha sido canjeado exitosamente!')
      setCodigo('')
      setDui('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-oxford-navy mb-1">Validar y Canjear Cupón</h1>
            {nombreEmpresa && <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{nombreEmpresa}</p>}
          </div>

          {mensaje && <div className="mb-6 p-4 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium">{mensaje}</div>}
          {error && <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg text-sm font-medium">{error}</div>}

          <form onSubmit={handleCanje} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código de Cupón</label>
              <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej. ABCD-1234" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DUI del Cliente</label>
              <input type="text" value={dui} onChange={(e) => setDui(e.target.value)} placeholder="Ej. 12345678-9" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full mt-4 py-3 px-4 bg-primary text-white font-bold rounded-lg shadow hover:bg-opacity-90 transition-colors disabled:opacity-70">
              {loading ? 'Validando...' : 'Validar y Canjear'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
