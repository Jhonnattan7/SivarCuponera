import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";
import { createInternalUserViaEdge } from "./internalUsersServiceEdge";

const USE_EDGE_FUNCTIONS = import.meta.env.VITE_USE_EDGE_FUNCTIONS === "true";

function generateTemporaryPassword(length = 18) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => chars[n % chars.length]).join("");
}

async function createInternalUserViaClient({ role, firstName, lastName, email, companyId }) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
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
      id: data.user.id,
      role,
      company_id: companyId,
      first_name: firstName,
      last_name: lastName,
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

export async function createInternalUser({ role, firstName, lastName, email, companyId }) {
  if (!role || !companyId) {
    throw new Error("Faltan datos obligatorios para crear usuario interno.");
  }

  if (USE_EDGE_FUNCTIONS) {
    try {
      return await createInternalUserViaEdge({ role, firstName, lastName, email, companyId });
    } catch (error) {
      console.warn("Edge Function no disponible. Usando flujo cliente temporal.", error);
      return createInternalUserViaClient({ role, firstName, lastName, email, companyId });
    }
  }

  return createInternalUserViaClient({ role, firstName, lastName, email, companyId });
}

export function createEmployee({ firstName, lastName, email, companyId }) {
  return createInternalUser({
    role: "company_employee",
    firstName,
    lastName,
    email,
    companyId,
  });
}

export function createCompanyAdmin({ firstName, lastName, email, companyId }) {
  return createInternalUser({
    role: "company_admin",
    firstName,
    lastName,
    email,
    companyId,
  });
}
