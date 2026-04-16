import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCompanies, deleteCompany } from "../../services/companiesService";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import FeedbackMessage from "../../components/common/FeedbackMessage";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "info", message: "" });
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const location = useLocation();

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    const incomingFeedback = location.state?.feedback;
    if (incomingFeedback?.message) {
      setFeedback(incomingFeedback);
    }
  }, [location.state]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      setFeedback({ type: "error", message: "Error al cargar empresas: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id, name) => {
    setCompanyToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!companyToDelete) return;
    try {
      await deleteCompany(companyToDelete.id);
      setFeedback({ type: "success", message: "Empresa eliminada correctamente." });
      loadCompanies();
    } catch (error) {
      setFeedback({ type: "error", message: "No se pudo eliminar la empresa: " + error.message });
    } finally {
      setCompanyToDelete(null);
    }
  };

  if (loading) return <div>Cargando empresas...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Empresas Ofertantes</h1>
        <Link
          to="/admin/companies/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Nueva Empresa
        </Link>
      </div>

      <FeedbackMessage type={feedback.type} message={feedback.message} />

      <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rubro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comisión</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                  {company.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{company.name}</div>
                  <div className="text-sm text-gray-500">{company.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.categories?.name || "Sin Rubro"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  {company.commission_pct}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <Link
                    to={`/admin/companies/${company.id}`}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Ver
                  </Link>
                  <Link
                    to={`/admin/companies/${company.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(company.id, company.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No hay empresas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(companyToDelete)}
        title="Eliminar empresa"
        message={companyToDelete ? `¿Estás seguro de eliminar a "${companyToDelete.name}"?` : ""}
        confirmText="Eliminar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setCompanyToDelete(null)}
      />
    </div>
  );
}