import { supabase } from './supabaseClient';

// Usamos la VISTA de base de datos 'offer_financials' que ya calcula totales
export const getOfferFinancials = async (companyId = null) => {
  let query = supabase
    .from('offer_financials')
    .select('*');

  // Si pasamos un ID de empresa, filtramos. Si no, trae de todas (útil para Admin global)
  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};