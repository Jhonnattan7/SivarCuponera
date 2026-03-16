import { supabase } from './supabaseClient';

// Obtener solo las ofertas pendientes de aprobación
export const getPendingOffers = async () => {
  const { data, error } = await supabase
    .from('offers')
    .select('*, companies(name)') // Necesitamos saber qué empresa la envió
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const approveOffer = async (id) => {
  const { data, error } = await supabase
    .from('offers')
    .update({ status: 'approved' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const rejectOffer = async (id, reason) => {
  const { data, error } = await supabase
    .from('offers')
    .update({ 
      status: 'rejected',
      rejection_reason: reason 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};