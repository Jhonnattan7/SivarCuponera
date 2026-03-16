import { supabase } from './supabaseClient';

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
};

export const createCategory = async (name) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCategory = async (id, name) => {
  const { data, error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (id) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};