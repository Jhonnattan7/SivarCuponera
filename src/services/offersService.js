import { supabase } from './supabaseClient';

// Obtener solo las ofertas pendientes de aprobación (para admin)
export const getPendingOffers = async () => {
  const { data, error } = await supabase
    .from('offers')
    .select('*, companies(name)')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const approveOffer = async (id) => {
  const { data, error } = await supabase
    .from('offers')
    .update({ status: 'approved', rejection_reason: null })
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

// --- Nuevos métodos para la Empresa (Company Admin) ---

export const getOffersByCompany = async (companyId) => {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createOffer = async (offerData) => {
  const { data, error } = await supabase
    .from('offers')
    .insert({
      ...offerData,
      status: 'pending_approval' // Por defecto al crear
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateOffer = async (id, offerData) => {
  const { data, error } = await supabase
    .from('offers')
    .update(offerData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const discardOffer = async (id) => {
  const { data, error } = await supabase
    .from('offers')
    .update({ status: 'discarded' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const resubmitOffer = async (id, offerData = {}) => {
  const { data, error } = await supabase
    .from('offers')
    .update({
      ...offerData,
      status: 'pending_approval',
      rejection_reason: null
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteOffer = async (id) => {
  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};