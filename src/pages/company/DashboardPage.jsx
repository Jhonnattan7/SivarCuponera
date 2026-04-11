import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getOffersByCompany } from "../../services/offersService";
import { getEmployeesByCompany } from "../../services/employeesService";

export default function DashboardPage() {
    const { profile } = useAuth();
    const [stats, setStats] = useState({ activeOffers: 0, employees: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.company_id) {
            loadStats();
        }
    }, [profile]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [offers, employees] = await Promise.all([
                getOffersByCompany(profile.company_id),
                getEmployeesByCompany(profile.company_id)
            ]);

            // Consideramos "Activas" a las ofertas con status "approved"
            const activeOffersCount = offers?.filter(o => o.status === "approved").length || 0;
            const employeesCount = employees?.length || 0;

            setStats({
                activeOffers: activeOffersCount,
                employees: employeesCount
            });
        } catch (error) {
            console.error("Error cargando estadísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Bienvenido al Panel de Empresa</h1>
            <p className="text-slate-600">
                Desde aquí puedes gestionar tus empleados, crear nuevas ofertas y verificar el estado de las mismas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h2 className="text-xl font-semibold text-blue-800">Ofertas Activas</h2>
                    <p className="mt-2 text-3xl font-bold text-blue-600">
                        {loading ? "..." : stats.activeOffers}
                    </p>
                </div>
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h2 className="text-xl font-semibold text-green-800">Empleados</h2>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {loading ? "..." : stats.employees}
                    </p>
                </div>
            </div>
        </div>
    );
}

