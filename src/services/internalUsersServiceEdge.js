import { supabase } from "./supabaseClient";

const FUNCTION_NAME = "create-internal-user";

export async function createInternalUserViaEdge({ role, firstName, lastName, email, companyId }) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    body: {
      role,
      firstName,
      lastName,
      email: normalizedEmail,
      companyId,
    },
  });

  if (error) {
    throw new Error(error.message || "Error invocando Edge Function de usuarios internos.");
  }

  return data;
}
