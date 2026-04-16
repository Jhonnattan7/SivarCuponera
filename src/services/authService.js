// src/services/authService.js
import { supabase } from "./supabaseClient";
import {
  createCompanyAdmin as createCompanyAdminInternal,
  createEmployee as createEmployeeInternal,
} from "./internalUsersService";

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
  return createEmployeeInternal({ firstName, lastName, email, companyId });
}

export async function createCompanyAdmin({ firstName, lastName, email, companyId }) {
  return createCompanyAdminInternal({ firstName, lastName, email, companyId });
}