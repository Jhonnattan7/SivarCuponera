import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getCompanyAdminsByCompany,
  getCompanyByIdWithCategory,
  getCompanyEmployeesByCompany,
} from "../../services/adminService";

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) loadDetail(id);
  }, [id]);

  const loadDetail = async (companyId) => {
    try {
      setLoading(true);
      setError("");

      const [companyData, adminsData, employeesData] = await Promise.all([
        getCompanyByIdWithCategory(companyId),
        getCompanyAdminsByCompany(companyId),
        getCompanyEmployeesByCompany(companyId),
      ]);

      setCompany(companyData);
      setAdmins(adminsData || []);
      setEmployees(employeesData || []);
    } catch (err) {
      setError("No se pudo cargar el detalle de la empresa.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Cargando detalle de empresa...</div>;

  if (error) {
    return (
      <div>
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>
        <button
          onClick={() => navigate("/admin/companies")}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Detalle de Empresa</h1>
        <div className="flex gap-2">
          <Link
            to={`/admin/companies/${company.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Editar Empresa
          </Link>
          <button
            onClick={() => navigate("/admin/companies")}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Volver
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-5 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><span className="font-semibold">Nombre:</span> {company?.name}</p>
          <p><span className="font-semibold">Código:</span> {company?.code}</p>
          <p><span className="font-semibold">Rubro:</span> {company?.categories?.name || "N/D"}</p>
          <p><span className="font-semibold">Comisión:</span> {company?.commission_pct}%</p>
          <p><span className="font-semibold">Email:</span> {company?.email}</p>
          <p><span className="font-semibold">Teléfono:</span> {company?.phone}</p>
          <p className="md:col-span-2"><span className="font-semibold">Dirección:</span> {company?.address}</p>
          <p><span className="font-semibold">Contacto:</span> {company?.contact_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <h3 className="text-lg font-bold mb-3">Admins de Empresa ({admins.length})</h3>
          {admins.length === 0 ? (
            <p className="text-sm text-slate-500">No hay administradores de empresa registrados.</p>
          ) : (
            <ul className="space-y-2">
              {admins.map((admin) => (
                <li key={admin.id} className="text-sm border rounded p-2 bg-slate-50">
                  {(admin.first_name || "") + " " + (admin.last_name || "")}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <h3 className="text-lg font-bold mb-3">Empleados ({employees.length})</h3>
          {employees.length === 0 ? (
            <p className="text-sm text-slate-500">No hay empleados registrados.</p>
          ) : (
            <ul className="space-y-2">
              {employees.map((employee) => (
                <li key={employee.id} className="text-sm border rounded p-2 bg-slate-50">
                  {(employee.first_name || "") + " " + (employee.last_name || "")}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
