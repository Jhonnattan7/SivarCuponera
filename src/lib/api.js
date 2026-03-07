import { supabase } from './supabase'

export const obtenerOfertasActivas = async (idCategoria = null, busqueda = null) => {
  try {
    let query = supabase
      .from('Cupones')
      .select('*')
      .gt('cantidad_cupon', 0)
      .lte('fecha_inicio', new Date().toISOString())
      .gte('fecha_fin', new Date().toISOString())

    if (idCategoria) {
      query = query.eq('id_categoria', idCategoria)
    }

    if (busqueda) {
      query = query.or(`titulo.ilike.%${busqueda}%,Tienda.ilike.%${busqueda}%`)
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
      .from('Categorias')
      .select('*')
      .order('nombre', { ascending: true })

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
    .eq('id', userId)

  if (error) {
    console.error('Error al cargar cupones del usuario:', error)
    return []
  }

  return data || []
}

export const comprarCupon = async (id_cupon) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    const { data: cupon, error: errorCupon } = await supabase
      .from('Cupones')
      .select('*')
      .eq('id_cupones', id_cupon)
      .single()

    if (errorCupon || !cupon) {
      return { success: false, error: 'Cupón no encontrado' }
    }

    if (cupon.cantidad_cupon <= 0) {
      return { success: false, error: 'Stock agotado' }
    }

    const fechaActual = new Date().toISOString()
    if (fechaActual < cupon.fecha_inicio || fechaActual > cupon.fecha_fin) {
      return { success: false, error: 'Oferta no vigente' }
    }

    const codigoUnico = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const { data: compra, error: errorCompra } = await supabase
      .from('CuponesComprados')
      .insert({
        id_cupones: id_cupon,
        id: user.id,
        codigo: codigoUnico,
        estado: 'Vigente'
      })
      .select()
      .single()

    if (errorCompra) {
      console.error('Error al registrar compra:', errorCompra)
      return { success: false, error: 'Error al registrar la compra' }
    }

    const { error: errorStock } = await supabase
      .from('Cupones')
      .update({ cantidad_cupon: cupon.cantidad_cupon - 1 })
      .eq('id_cupones', id_cupon)

    if (errorStock) {
      console.error('Error al reducir stock:', errorStock)
    }

    return { 
      success: true, 
      data: { 
        codigo: codigoUnico,
        compra 
      } 
    }

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
  const diferencia = fin - hoy
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
}