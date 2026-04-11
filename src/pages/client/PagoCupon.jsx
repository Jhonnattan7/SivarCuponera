import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { comprarCupon } from '../../utils/api'
import { supabase } from '../../services/supabaseClient'

const initialForm = {
  nombre: '',
  numero: '',
  fecha: '',
  cvv: ''
}

export default function PagoCupon() {
  const location = useLocation()
  const navigate = useNavigate()

  const offerId = location.state?.offerId ?? location.state?.id_cupon
  const precio = location.state?.price ?? location.state?.precio ?? 0
  const titulo = location.state?.title ?? 'Cupón seleccionado'
  const empresa = location.state?.companyName ?? 'Empresa'
  const image = location.state?.image ?? null
  const imageSrc = image
    ? (typeof image === 'string' && image.startsWith('http') ? image : `/img/${image}`)
    : null

  const [form, setForm] = useState(initialForm)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [codigoGenerado, setCodigoGenerado] = useState('')
  const [transactionAt, setTransactionAt] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const monto = useMemo(() => Number(precio) || 0, [precio])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'numero' || name === 'cvv') {
      const digitsOnly = value.replace(/\D/g, '')
      setForm((prev) => ({ ...prev, [name]: digitsOnly }))
      return
    }

    if (name === 'fecha') {
      const raw = value.replace(/\D/g, '').slice(0, 4)
      const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw
      setForm((prev) => ({ ...prev, [name]: formatted }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validatePaymentData = () => {
    const numero = form.numero.trim()
    const cvv = form.cvv.trim()
    const fecha = form.fecha.trim()

    if (!/^\d{16}$/.test(numero)) {
      return 'El número de tarjeta debe tener exactamente 16 dígitos.'
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fecha)) {
      return 'La fecha debe tener formato MM/AA válido.'
    }

    const [mes, anio] = fecha.split('/').map(Number)
    const now = new Date()
    const currentYear = now.getFullYear() % 100
    const currentMonth = now.getMonth() + 1

    const expired = anio < currentYear || (anio === currentYear && mes < currentMonth)
    if (expired) {
      return 'La tarjeta está expirada.'
    }

    if (!/^\d{3}$/.test(cvv)) {
      return 'El CVV debe tener exactamente 3 dígitos.'
    }

    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!offerId) {
      setError('No se encontró la oferta para procesar el pago.')
      return
    }

    const validationError = validatePaymentData()
    if (validationError) {
      setError(validationError)
      return
    }

    setProcesando(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const compra = await comprarCupon(offerId, {
        titulo,
        empresa,
        precio: monto.toFixed(2)
      })

      if (!compra.success) {
        setError(compra.error || 'No se pudo procesar el pago.')
        return
      }

      setCodigoGenerado(compra.data.codigo)
      setTransactionAt(new Date().toISOString())
      setUserEmail(userData?.user?.email || '')
      setForm(initialForm)
    } catch (err) {
      setError(err.message || 'No se pudo completar la compra.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-bold text-oxford-navy mb-4">Resumen del Cupón</h2>

          <div className="flex items-start gap-4">
            <div className="w-28 h-28 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
              {imageSrc ? (
                <img src={imageSrc} alt={titulo} className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 text-3xl font-bold">{empresa.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500">Empresa</p>
              <p className="font-semibold text-slate-800">{empresa}</p>
              <p className="text-sm text-slate-500 mt-2">Oferta</p>
              <p className="font-semibold text-slate-800">{titulo}</p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">Total a pagar</p>
            <p className="text-3xl font-bold text-primary">${monto.toFixed(2)}</p>
          </div>
        </article>

        <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-bold text-oxford-navy mb-4">Pago con Tarjeta</h2>
          <p className="text-sm text-slate-500 mb-4">
            Puedes ingresar una tarjeta de prueba. No se validará contra un procesador real.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm text-slate-700">Nombre del titular</span>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-700">Número de tarjeta</span>
              <input
                type="text"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                maxLength={16}
                inputMode="numeric"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-slate-700">Expiración (MM/AA)</span>
                <input
                  type="text"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  placeholder="MM/AA"
                  maxLength={5}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-700">CVV</span>
                <input
                  type="text"
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                  maxLength={3}
                  inputMode="numeric"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={procesando}
              className="w-full mt-2 py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-60"
            >
              {procesando ? 'Procesando pago...' : 'Procesar Pago'}
            </button>
          </form>
        </article>
      </div>

      {codigoGenerado && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
          <p className="text-emerald-700 font-semibold">Pago aprobado y cupón generado</p>
          <p className="mt-2 text-xs text-slate-600">Código del cupón</p>
          <p className="text-2xl font-mono font-bold tracking-wider text-emerald-800">{codigoGenerado}</p>
          <p className="mt-2 text-sm text-slate-600">
            {userEmail && <>Correo: {userEmail} | </>}
            Fecha/Hora: {new Date(transactionAt).toLocaleString('es-SV')}
          </p>
        </div>
      )}
    </section>
  )
}