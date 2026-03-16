import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";

export default function AdminLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar / Navegación */}
      <aside className="w-full md:w-64 bg-slate-800 text-white flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-slate-400 mt-1">
            Hola, {profile?.first_name || "Admin"}
          </p>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <Link
            to="/admin/dashboard"
            className="block px-4 py-2 hover:bg-slate-700 rounded transition"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/companies"
            className="block px-4 py-2 hover:bg-slate-700 rounded transition"
          >
            Empresas
          </Link>
          <Link
            to="/admin/categories"
            className="block px-4 py-2 hover:bg-slate-700 rounded transition"
          >
            Rubros
          </Link>
          <div className="border-t border-slate-700 my-2"></div>
          <Link
            to="/admin/offers/review"
            className="text-cyan-400 border border-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-bold px-3 py-1 rounded transition"
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

      {/* Contenido Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-sm min-h-[500px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}