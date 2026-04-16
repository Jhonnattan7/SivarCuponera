export const roleRedirectMap = {
  admin: "/admin/dashboard",
  company_admin: "/company/dashboard",
  company_employee: "/empleado/canje",
  client: "/",
};

export function getRoleRedirectPath(role) {
  return roleRedirectMap[role] || "/";
}