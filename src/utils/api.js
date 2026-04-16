import { supabase } from '../services/supabaseClient'

export const obtenerOfertasActivas = async (idCategoria = null) => {
  try {
    let query = supabase
      .from('active_offers')
      .select('*')

    if (idCategoria) {
      query = query.ilike('category_name', idCategoria)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error al cargar ofertas:', error)
    return { success: false, error: error.message, data: [] }
  }
}

export const obtenerRubros = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    return { success: false, error: error.message, data: [] }
  }
}

export const obtenerCategorias = obtenerRubros

export const obtenerCuponesPorUsuario = async (userId) => {
  const { data, error } = await supabase
    .from('coupons')
    .select(`
      *,
      offers (
        title,
        description,
        end_date,
        coupon_expiry_date,
        companies ( name )
      )
    `)
    .eq('client_id', userId)

  if (error) {
    console.error('Error al cargar cupones del usuario:', error)
    return []
  }

  return data || []
}

export const comprarCupon = async (offerId, datosCupon = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Usuario no autenticado' }

    const { data, error } = await supabase.rpc('purchase_coupon', { p_offer_id: offerId })
    if (error) throw error

    const rpcRow = Array.isArray(data) ? data[0] : data
    const codigo = typeof rpcRow === 'string' ? rpcRow : (rpcRow?.codigo ?? null)
    const correo = typeof rpcRow === 'object' && rpcRow !== null ? (rpcRow.correo ?? null) : null
    const transactionAt = typeof rpcRow === 'object' && rpcRow !== null
      ? (rpcRow.transaction_at ?? rpcRow.transactionAt ?? null)
      : null

    if (!codigo) {
      return { success: false, error: 'No se pudo generar el código del cupón.' }
    }

    // Enviar correo (no bloquea la compra si falla)
    try {
      await supabase.functions.invoke('send-coupon-email', {
        body: {
          email: correo || user.email,
          codigo,
          titulo: datosCupon.titulo || 'Oferta',
          empresa: datosCupon.empresa || 'Empresa',
          precio: datosCupon.precio || '0.00',
        }
      })
    } catch (e) {
      console.warn('Correo no enviado:', e)
    }

    return { success: true, data: { codigo, correo, transactionAt } }
  } catch (error) {
    console.error('Error en comprarCupon:', error)
    return { success: false, error: error.message }
  }
}

export const calcularDescuento = (precioRegular, precioOferta) => {
  if (!precioRegular || precioRegular <= 0) return 0
  return Math.round(((precioRegular - precioOferta) / precioRegular) * 100)
}

export const calcularDiasRestantes = (fechaFin) => {
  const hoy = new Date()
  const fin = new Date(fechaFin)
  return Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24))
}