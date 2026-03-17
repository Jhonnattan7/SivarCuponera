import { supabase } from './supabaseClient';

export const getEmployeesByCompany = async (companyId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', companyId)
        .eq('role', 'company_employee')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

// Note: Complete deletion of auth users requires Supabase Admin API.
// Without it, deleting from 'profiles' might just soft delete or break the FK.
// If RLS allows deleting from 'profiles', we do it here.
export const deleteEmployeeProfile = async (id) => {
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
};

export const updateEmployeeProfile = async (id, dataToUpdate) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};
