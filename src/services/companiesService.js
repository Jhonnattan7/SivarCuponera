import { supabase } from './supabaseClient';

export const getCompanies = async () => {
  // Traemos también el nombre del rubro (categories) gracias a la relación FK
  const { data, error } = await supabase
    .from('companies')
    .select('*, categories(name)') 
    .order('name');

  if (error) throw error;
  return data;
};

export const getCompanyById = async (id) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*, categories(name)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createCompany = async (companyData) => {
  // companyData debe ser un objeto con: { name, code, address, contact_name, phone, email, category_id, commission_pct }
  const { data, error } = await supabase
    .from('companies')
    .insert([companyData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCompany = async (id, companyData) => {
  const { data, error } = await supabase
    .from('companies')
    .update(companyData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCompany = async (id) => {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (error) throw error;
};