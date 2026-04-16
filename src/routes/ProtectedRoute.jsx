import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleRedirectPath } from "./roleRedirect";

/**
 * Props:
 *  - allowedRoles: string[]  → ruta privada por rol; redirige a / si el rol no aplica
 *  - guestOnly: bool         → solo sin sesión activa (login, signup, forgot-password)
 *  - requireAuth: bool       → requiere sesión; redirige a /signup si no la hay
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  guestOnly = false,
  requireAuth = false,
}) {
  const { session, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Rutas de invitado: si hay sesión activa, siempre al home
  if (guestOnly) {
    if (session) {
      return <Navigate to={getRoleRedirectPath(role)} replace />;
    }
    return children;
  }

  // Requiere sesión (sin restricción de rol)
  // Caso: /pago-cupon → usuario no logueado va a /signup
  if (requireAuth) {
    if (!session) return <Navigate to="/signup" state={{ from: location }} replace />;
    return children;
  }

  // Ruta restringida por rol
  if (allowedRoles) {
    if (!session) return <Navigate to="/signup" state={{ from: location }} replace />;
    if (!role) return null; // perfil aún cargando
    if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
    return children;
  }

  return children;
}