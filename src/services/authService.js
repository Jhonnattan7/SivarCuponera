// src/services/authService.js
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

function generateTemporaryPassword(length = 18) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => chars[n % chars.length]).join("");
}

export async function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
  if (error) throw error;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  // Permitir inicio de sesión aunque el perfil no exista todavía.
  if (profileError) {
    console.error("Error obteniendo perfil durante login:", profileError.message);
  }

  return { session: data.session, user: data.user, profile: profile ?? null };
}

export async function signup({ firstName, lastName, phone, email, address, dui, password }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("No se pudo crear el usuario.");

  const profileData = {
      id:         data.user.id,
      role:       "client",
      first_name: firstName,
      last_name:  lastName,
      phone,
      address,
      dui,
    };

  const { error:profileError } = await supabase
    .from("profiles")
    .insert(profileData)

  if (profileError) throw profileError;

  return {...data, profile: profileData};
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPasswordForEmail(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function createEmployee({ firstName, lastName, email, companyId }) {
  const normalizedEmail = email.trim().toLowerCase();
  const temporaryPassword = generateTemporaryPassword();

  // Creamos una instancia temporal para que el signUp no modifique la sesión actual (del admin)
  const tempSupabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data, error } = await tempSupabase.auth.signUp({
    email: normalizedEmail,
    password: temporaryPassword,
  });
  if (error) throw error;
  if (!data.user) throw new Error("No se pudo crear el usuario en Auth.");

  // Usamos la instancia principal (que aún tiene la sesión de company_admin activa)
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id:         data.user.id,
      role:       "company_employee",
      company_id: companyId,
      first_name: firstName,
      last_name:  lastName,
    });

  if (profileError) throw profileError;

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (resetError) {
    throw new Error(`Usuario creado, pero no se pudo enviar correo de activacion: ${resetError.message}`);
  }

  return data;
}

export async function createCompanyAdmin({ firstName, lastName, email, companyId }) {
  const normalizedEmail = email.trim().toLowerCase();
  const temporaryPassword = generateTemporaryPassword();

  const tempSupabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data, error } = await tempSupabase.auth.signUp({
    email: normalizedEmail,
    password: temporaryPassword,
  });
  if (error) throw error;
  if (!data.user) throw new Error("No se pudo crear el usuario en Auth.");

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id:         data.user.id,
      role:       "company_admin",
      company_id: companyId,
      first_name: firstName,
      last_name:  lastName,
    });

  if (profileError) throw profileError;

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (resetError) {
    throw new Error(`Usuario creado, pero no se pudo enviar correo de activacion: ${resetError.message}`);
  }

  return data;
}