import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"
import ProtectedRoute from "./ProtectedRoute";

import Layout from "../components/ui/Layout";
import Home from "../pages/public/Home";
import LogIn from "../pages/public/LogIn";
import SignUp from "../pages/public/SignUp";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";

import MisCuponesComprados from "../pages/client/MisCuponesComprados";
import PagoCupon from "../pages/client/PagoCupon";

import AdminLayout from "../pages/admin/AdminLayout";
import DashboardPage from "../pages/admin/DashboardPage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import CompaniesPage from "../pages/admin/CompaniesPage";
import CompanyFormPage from "../pages/admin/CompanyFormPage";
import CompanyDetailPage from "../pages/admin/CompanyDetailPage";
import ClientsPage from "../pages/admin/ClientsPage";
import CompanyAdminsPage from "../pages/admin/CompanyAdminsPage";
import OffersReviewPage from "../pages/admin/OffersReviewPage";

import CompanyLayout from "../pages/company/CompanyLayout";
import DashboardPageCompany from "../pages/company/DashboardPage";
import EmployeesPage from "../pages/company/EmployeesPage";
import OffersPage from "../pages/company/OffersPage";
import OfferFormPage from "../pages/company/OfferFormPage";

import CanjeCupon from "../pages/employee/CanjeCupon";

// Componente interno: redirige roles no-cliente fuera del home
function HomeOrRedirect() {
  const { session, role, loading } = useAuth();

  if (loading) return null;

  if (session && role === "admin")            return <Navigate to="/admin/dashboard"  replace />;
  if (session && role === "company_admin")    return <Navigate to="/company/dashboard" replace />;
  if (session && role === "company_employee") return <Navigate to="/empleado/canje"   replace />;

  // cliente autenticado o visitante anónimo → ve el home
  return <Home />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<Layout />}>
          {/* Home: accesible para todos sin excepción */}
          <Route path="/" element={<Home />} />

          {/* Mis cupones: solo clientes autenticados */}
          <Route
            path="/client/coupons"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <MisCuponesComprados />
              </ProtectedRoute>
            }
          />

          {/* Pago: requiere sesión (cualquier rol), sin sesión → /signup */}
          <Route
            path="/pago-cupon"
            element={
              <ProtectedRoute requireAuth>
                <PagoCupon />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/login"           element={<ProtectedRoute guestOnly><LogIn /></ProtectedRoute>} />
        <Route path="/signup"          element={<ProtectedRoute guestOnly><SignUp /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ProtectedRoute guestOnly><ForgotPassword /></ProtectedRoute>} />

        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"          element={<DashboardPage />} />
          <Route path="companies"          element={<CompaniesPage />} />
          <Route path="companies/new"      element={<CompanyFormPage />} />
          <Route path="companies/:id/edit" element={<CompanyFormPage />} />
          <Route path="companies/:id"      element={<CompanyDetailPage />} />
          <Route path="categories"         element={<CategoriesPage />} />
          <Route path="clients"            element={<ClientsPage />} />
          <Route path="company-admins"     element={<CompanyAdminsPage />} />
          <Route path="offers/review"      element={<OffersReviewPage />} />
          <Route path="*"                  element={<div>Página no encontrada</div>} />
        </Route>

        <Route
          path="/company"
          element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <CompanyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"       element={<DashboardPageCompany />} />
          <Route path="offers"          element={<OffersPage />} />
          <Route path="offers/new"      element={<OfferFormPage />} />
          <Route path="offers/:id/edit" element={<OfferFormPage />} />
          <Route path="employees"       element={<EmployeesPage />} />
        </Route>

        <Route
          path="/empleado/canje"
          element={
            <ProtectedRoute allowedRoles={["company_employee"]}>
              <CanjeCupon />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}