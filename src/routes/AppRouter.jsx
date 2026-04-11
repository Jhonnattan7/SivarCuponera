import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

//Aquí importan las páginas que se van a desplegar
// import {nombre del componente} from {ruta del componente}
// Clasifiquenlas según las siguientes secciones de rol

//Public
import Layout from "../components/ui/Layout";
import Home from "../pages/public/Home";
import LogIn from "../pages/public/LogIn";
import SignUp from "../pages/public/SignUp";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";

//Client
import MisCuponesComprados from "../pages/client/MisCuponesComprados";
import PagoCupon from "../pages/client/PagoCupon";
// import ClientSettings from "../pages/client/ClientSettings";

//Admin
import AdminLayout from "../pages/admin/AdminLayout";
import DashboardPage from "../pages/admin/DashboardPage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import CompaniesPage from "../pages/admin/CompaniesPage";
import CompanyFormPage from "../pages/admin/CompanyFormPage";
import CompanyDetailPage from "../pages/admin/CompanyDetailPage";
import ClientsPage from "../pages/admin/ClientsPage";
import CompanyAdminsPage from "../pages/admin/CompanyAdminsPage";
import OffersReviewPage from "../pages/admin/OffersReviewPage";

//Company
import CompanyLayout from "../pages/company/CompanyLayout";
import DashboardPageCompany from "../pages/company/DashboardPage";
import EmployeesPage from "../pages/company/EmployeesPage";
import OffersPage from "../pages/company/OffersPage";
import OfferFormPage from "../pages/company/OfferFormPage";

//Employee
import CanjeCupon from "../pages/employee/CanjeCupon";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Sitio público + cliente autenticado ── */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {/* <Route path="/offers/:id" element={<OfferDetailPage />} /> */}

          <Route
            path="/client/coupons"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <MisCuponesComprados />
              </ProtectedRoute>
            }
          />
          <Route
            path="pago-cupon"
            element={<PagoCupon />}
          />
          {/* <Route
            path="/client/settings"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientSettings />
              </ProtectedRoute>
            }
          /> */}
        </Route>

        {/* ── Auth: solo accesibles sin sesión activa ── */}
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ── Reset password: siempre pública ── */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ── Admin ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/new" element={<CompanyFormPage />} />
          <Route path="companies/:id/edit" element={<CompanyFormPage />} />
          <Route path="companies/:id" element={<CompanyDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />

          <Route path="clients" element={<ClientsPage />} />
          <Route path="company-admins" element={<CompanyAdminsPage />} />
          {<Route path="offers/review" element={<OffersReviewPage />} />}
          {/* <Route path="settings"           element={<AdminSettings />} /> */}
          <Route path="*" element={<div>Página en construcción (Admin)</div>} />
        </Route>

        {/* ── Company Admin ── */}
        <Route
          path="/company"
          element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <CompanyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPageCompany />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="offers/new" element={<OfferFormPage />} />
          <Route path="offers/:id/edit" element={<OfferFormPage />} />
          <Route path="employees" element={<EmployeesPage />} />
        </Route>

        {/* ── Empleado ── */}
        <Route
          path="/empleado/canje"
          element={
            <ProtectedRoute allowedRoles={["company_employee"]}>
              <CanjeCupon />
            </ProtectedRoute>
          }
        />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}