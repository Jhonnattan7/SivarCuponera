import { supabase } from './supabaseClient';

export const getClients = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, address, dui, created_at')
    .eq('role', 'client')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getCompanyByIdWithCategory = async (id) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*, categories(name)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const getCompanyAdminsByCompany = async (companyId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role, created_at')
    .eq('role', 'company_admin')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getCompanyEmployeesByCompany = async (companyId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role, created_at')
    .eq('role', 'company_employee')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getCompanyAdmins = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role, company_id, created_at, companies(name, code)')
    .eq('role', 'company_admin')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateCompanyAdminProfile = async (id, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .eq('role', 'company_admin')
    .select('id, first_name, last_name, role, company_id, created_at')
    .single();

  if (error) throw error;
  return data;
};

export const deleteCompanyAdminProfile = async (id) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)
    .eq('role', 'company_admin');

  if (error) throw error;
  return true;
};
