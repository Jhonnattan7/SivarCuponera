export const isRequired = (value) => String(value ?? "").trim().length > 0;

export const isValidEmail = (email) => {
  const normalized = String(email ?? "").trim();
  return /^\S+@\S+\.\S+$/.test(normalized);
};

export const isValidDui = (dui) => /^\d{8}-\d$/.test(String(dui ?? "").trim());

export const isValidPhoneSv = (phone) => /^\d{4}-\d{4}$/.test(String(phone ?? "").trim());

export const isMinLength = (value, min) => String(value ?? "").length >= min;

export const validateCardNumber = (value) => /^\d{16}$/.test(String(value ?? "").trim());

export const validateCardCvv = (value) => /^\d{3}$/.test(String(value ?? "").trim());

export const validateCardExpiry = (value) => {
  const raw = String(value ?? "").trim();
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(raw)) return false;

  const [mes, anio] = raw.split("/").map(Number);
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  const expired = anio < currentYear || (anio === currentYear && mes < currentMonth);
  return !expired;
};