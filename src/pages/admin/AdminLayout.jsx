import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";

export default function AdminLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* ── MOBILE HEADER (Solo visible en móviles) ── */}
      <div className="md:hidden bg-slate-800 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded hover:bg-slate-700 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ── OVERLAY MÓVIL (Fondo oscuro al abrir menú) ── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ── SIDEBAR (Responsiva) ── */}
      <aside 
        className={`
          flex flex-col flex-shrink-0 bg-slate-800 text-white w-64
          transition-transform duration-300 ease-in-out
          
          /* Estilos Móvil (Fixed, Off-canvas) */
          fixed inset-y-0 left-0 z-40
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}

          /* Estilos Desktop (Sticky, siempre visible) */
          md:translate-x-0 md:sticky md:top-0 md:h-screen md:static md:z-auto
        `}
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <p className="text-sm text-slate-400 mt-1">
              Hola, {profile?.first_name || "Admin"}
            </p>
          </div>
          {/* Botón X para cerrar en móvil */}
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <Link
            to="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="block px-4 py-2 hover:bg-slate-700 rounded transition"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/companies"
            onClick={() => setSidebarOpen(false)}
            className="block px-4 py-2 hover:bg-slate-700 rounded transition"
          >
            Empresas
          </Link>
          <Link
            to="/admin/categories"
            onClick={() => setSidebarOpen(false)}
            className="block px-4 py-2 hover:bg-slate-700 rounded transition"
          >
            Rubros
          </Link>
          <div className="border-t border-slate-700 my-2"></div>
          <Link
            to="/admin/offers/review"
            onClick={() => setSidebarOpen(false)}
            className="block text-cyan-400 border border-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-bold px-3 py-2 rounded transition text-center md:text-left"
          >
            Revisar Ofertas
          </Link>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <Link
            to="/"
            className="block px-4 py-2 text-center border border-slate-600 rounded text-slate-300 hover:text-white hover:border-white transition mb-3"
          >
            Volver al Sitio
          </Link>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-sm min-h-[500px]">
          <Outlet />
        </div>
      </main>

    </div>
  );
}