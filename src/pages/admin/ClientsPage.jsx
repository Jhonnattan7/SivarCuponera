import { useEffect, useMemo, useState } from "react";
import { getClients } from "../../services/adminService";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getClients();
      setClients(data || []);
    } catch (err) {
      setError("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;

    return clients.filter((client) => {
      const fullName = `${client.first_name || ""} ${client.last_name || ""}`.toLowerCase();
      const phone = (client.phone || "").toLowerCase();
      const dui = (client.dui || "").toLowerCase();
      return fullName.includes(q) || phone.includes(q) || dui.includes(q);
    });
  }, [clients, search]);

  if (loading) return <div className="p-8 text-slate-500">Cargando clientes...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Clientes Registrados</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, DUI o teléfono"
          className="w-full md:w-80 border border-slate-300 rounded px-3 py-2"
        />
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

      <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DUI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {(client.first_name || "") + " " + (client.last_name || "")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{client.dui || "N/D"}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{client.phone || "N/D"}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{client.address || "N/D"}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {client.created_at ? new Date(client.created_at).toLocaleDateString("es-SV") : "N/D"}
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center text-gray-500">
                  No hay clientes que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
