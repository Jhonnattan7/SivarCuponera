import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";

export default function CompanyLayout() {
    const { profile } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-slate-800 text-white flex-shrink-0 flex flex-col h-screen sticky top-0">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold">Panel Empresa</h2>
                    {profile?.companies?.name && (
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">{profile.companies.name}</p>
                    )}
                    <p className="text-sm text-slate-400 mt-1">
                        Hola, {profile?.first_name || "Admin de Empresa"}
                    </p>
                </div>

                <nav className="p-4 space-y-2 flex-1">
                    <Link
                        to="/company/dashboard"
                        className="block px-4 py-2 hover:bg-slate-700 rounded transition"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/company/offers"
                        className="block px-4 py-2 hover:bg-slate-700 rounded transition"
                    >
                        Mis Ofertas
                    </Link>
                    <Link
                        to="/company/employees"
                        className="block px-4 py-2 hover:bg-slate-700 rounded transition"
                    >
                        Gestionar Empleados
                    </Link>
                </nav>

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

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-sm min-h-[500px]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
