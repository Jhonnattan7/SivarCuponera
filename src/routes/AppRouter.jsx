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
import MisCupones from "../pages/client/MisCupones";
// import PagoCupon from "../pages/client/PagoCupon";
// import ClientSettings from "../pages/client/ClientSettings";

//Admin
import AdminLayout from "../pages/admin/AdminLayout";
import DashboardPage from "../pages/admin/DashboardPage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import CompaniesPage from "../pages/admin/CompaniesPage";
import CompanyFormPage from "../pages/admin/CompanyFormPage";
import OffersReviewPage from "../pages/admin/OffersReviewPage";

//Company
// import CompanyLayout from "../pages/company/CompanyLayout";
// import OffersPage from "../pages/company/OffersPage";
// import OfferFormPage from "../pages/company/OfferFormPage";

//Employee
// import EmployeeLayout from "../pages/employee/EmployeeLayout";
// import RedeemPage from "../pages/employee/RedeemPage";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Sitio público + cliente autenticado ── */}
        <Route element={<Layout />}>
          <Route path="/"           element={<Home />} />
          {/* <Route path="/offers/:id" element={<OfferDetailPage />} /> */}
          
          <Route
            path="/client/coupons"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <MisCupones />
              </ProtectedRoute>
            }
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
        <Route path="/login"            element={<LogIn />} />
        <Route path="/signup"           element={<SignUp />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />

        {/* ── Reset password: siempre pública ── */}
        <Route path="/reset-password"   element={<ResetPassword />} />

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
          <Route path="dashboard"          element={<DashboardPage />} />
          <Route path="companies"          element={<CompaniesPage />} />
          <Route path="companies/new"      element={<CompanyFormPage />} />
          <Route path="companies/:id/edit" element={<CompanyFormPage />} />
          {/* <Route path="companies/:id"      element={<CompanyDetailPage />} /> */}
          <Route path="categories"         element={<CategoriesPage />} />
          
          {/* <Route path="clients"            element={<ClientsPage />} /> */}
          {<Route path="offers/review"      element={<OffersReviewPage />} /> }
          {/* <Route path="settings"           element={<AdminSettings />} /> */}
          <Route path="*"                  element={<div>Página en construcción (Admin)</div>} />
        </Route>

        {/* ── Company Admin ── */}
        <Route
          path="/company"
          element={
            <ProtectedRoute allowedRoles={["company_admin"]}>
              <div>Panel Empresa (En construcción)</div>
              {/* <CompanyLayout /> */}
            </ProtectedRoute>
          }
        >
          {/* <Route index element={<Navigate to="offers" replace />} />
          <Route path="offers"          element={<OffersPage />} />
          <Route path="offers/new"      element={<OfferFormPage />} /> */}
        </Route>

        {/* ── Empleado ── */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["company_employee"]}>
              <div>Panel Empleado (En construcción)</div>
              {/* <EmployeeLayout /> */}
            </ProtectedRoute>
          }
        >
          {/* <Route index element={<Navigate to="redeem" replace />} />
          <Route path="redeem"   element={<RedeemPage />} /> */}
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}