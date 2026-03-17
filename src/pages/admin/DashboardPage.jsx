import { useEffect, useState } from "react";
import { getOfferFinancials } from "../../services/statsService";

export default function DashboardPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Totales para las tarjetas superiores
  const [totals, setTotals] = useState({
    income: 0,
    commission: 0,
    coupons: 0
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getOfferFinancials();
        setStats(data);
        
        // Calcular totales
        const income = data.reduce((acc, curr) => acc + (curr.total_revenue || 0), 0);
        const commission = data.reduce((acc, curr) => acc + (curr.service_charge || 0), 0);
        const coupons = data.reduce((acc, curr) => acc + (curr.coupons_sold || 0), 0);
        
        setTotals({ income, commission, coupons });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Cargando métricas del negocio...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Panel de Control</h1>

      {/* ── SECCIÓN 1: Tarjetas de Resumen (KPIs) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Tarjeta 1: Ingresos Totales */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium uppercase">Ventas Totales (Global)</span>
          <span className="text-3xl font-bold text-slate-900 mt-2">
            ${totals.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            Ingreso bruto generado
          </span>
        </div>

        {/* Tarjeta 2: Comisiones (Ganancia de La Cuponera) */}
        <div className="bg-white p-6 rounded-lg border-l-4 border-green-500 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium uppercase">Comisiones (Ganancia)</span>
          <span className="text-3xl font-bold text-green-600 mt-2">
            ${totals.commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Retenido por la plataforma
          </span>
        </div>

        {/* Tarjeta 3: Cupones Vendidos */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium uppercase">Cupones Vendidos</span>
          <span className="text-3xl font-bold text-blue-600 mt-2">
            {totals.coupons}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Transacciones exitosas
          </span>
        </div>
      </div>

      {/* ── SECCIÓN 2: Tabla Detallada ── */}
      <h2 className="text-lg font-bold mb-4 text-slate-700">Desglose por Oferta</h2>
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Oferta</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Empresa</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Vendidos</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Ingresos</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-green-600 uppercase">Comisión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stats.map((item) => (
              <tr key={item.offer_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900 max-w-xs truncate" title={item.title}>
                  {item.title}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.company_name}
                </td>
                <td className="px-6 py-4 text-sm text-right text-slate-600">
                  ${item.offer_price}
                </td>
                <td className="px-6 py-4 text-sm text-center font-bold text-slate-800">
                  {item.coupons_sold}
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">
                  ${item.total_revenue?.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                  ${item.service_charge?.toFixed(2)}
                </td>
              </tr>
            ))}
            {stats.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                  No hay datos financieros registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}