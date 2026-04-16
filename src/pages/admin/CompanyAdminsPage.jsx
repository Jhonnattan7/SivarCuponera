import { useEffect, useMemo, useState } from "react";
import { getCompanies } from "../../services/companiesService";
import { createCompanyAdmin } from "../../services/authService";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import FeedbackMessage from "../../components/common/FeedbackMessage";
import {
  deleteCompanyAdminProfile,
  getCompanyAdmins,
  updateCompanyAdminProfile,
} from "../../services/adminService";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  companyId: "",
};

export default function CompanyAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ type: "info", message: "" });
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [adminsData, companiesData] = await Promise.all([
        getCompanyAdmins(),
        getCompanies(),
      ]);
      setAdmins(adminsData || []);
      setCompanies(companiesData || []);
    } catch (err) {
      setError("No se pudieron cargar los administradores de empresa.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;

    return admins.filter((admin) => {
      const fullName = `${admin.first_name || ""} ${admin.last_name || ""}`.toLowerCase();
      const companyName = (admin.companies?.name || "").toLowerCase();
      const companyCode = (admin.companies?.code || "").toLowerCase();
      return fullName.includes(q) || companyName.includes(q) || companyCode.includes(q);
    });
  }, [admins, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyId) {
      setFeedback({ type: "error", message: "Debes seleccionar una empresa." });
      return;
    }

    if (editingId) {
      try {
        setSaving(true);
        await updateCompanyAdminProfile(editingId, {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          company_id: formData.companyId,
        });
        setFeedback({ type: "success", message: "Administrador actualizado correctamente." });
        resetForm();
        await loadData();
      } catch (err) {
        setFeedback({ type: "error", message: "No se pudo actualizar: " + err.message });
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!formData.email.trim()) {
      setFeedback({ type: "error", message: "Correo obligatorio para crear el usuario." });
      return;
    }

    try {
      setSaving(true);
      await createCompanyAdmin({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        companyId: formData.companyId,
      });
      setFeedback({
        type: "success",
        message: "Admin de empresa creado. Se envio correo para definir contrasena.",
      });
      resetForm();
      await loadData();
    } catch (err) {
      setFeedback({ type: "error", message: "No se pudo crear: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (admin) => {
    setEditingId(admin.id);
    setFormData({
      firstName: admin.first_name || "",
      lastName: admin.last_name || "",
      email: "",
      companyId: admin.company_id || "",
    });
  };

  const handleDelete = (admin) => {
    setAdminToDelete(admin);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;
    try {
      await deleteCompanyAdminProfile(adminToDelete.id);
      setFeedback({ type: "success", message: "Administrador eliminado." });
      if (editingId === adminToDelete.id) {
        resetForm();
      }
      await loadData();
    } catch (err) {
      setFeedback({ type: "error", message: "No se pudo eliminar: " + err.message });
    } finally {
      setAdminToDelete(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Cargando administradores de empresa...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Admins de Empresa</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o empresa"
          className="w-full md:w-80 border border-slate-300 rounded px-3 py-2"
        />
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
  <FeedbackMessage type={feedback.type} message={feedback.message} />

      <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-slate-50 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">
          {editingId ? "Editar Admin de Empresa" : "Nuevo Admin de Empresa"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            type="text"
            placeholder="Nombres"
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
            className="border rounded px-3 py-2"
          />
          <input
            required
            type="text"
            placeholder="Apellidos"
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
            className="border rounded px-3 py-2"
          />
        </div>

        {!editingId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              type="email"
              placeholder="Correo del admin"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="border rounded px-3 py-2"
            />
            <div className="border rounded px-3 py-2 bg-slate-100 text-sm text-slate-600">
              Se enviara un correo de activacion para que el usuario cree su contrasena.
            </div>
          </div>
        )}

        <select
          required
          value={formData.companyId}
          onChange={(e) => setFormData((prev) => ({ ...prev, companyId: e.target.value }))}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Seleccionar empresa --</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name} ({company.code})
            </option>
          ))}
        </select>

        <div className="flex gap-3 justify-end">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded hover:bg-white"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear Admin"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {(admin.first_name || "") + " " + (admin.last_name || "")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {admin.companies?.name || "Sin empresa"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {admin.created_at ? new Date(admin.created_at).toLocaleDateString("es-SV") : "N/D"}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleEdit(admin)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(admin)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {filteredAdmins.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-6 text-center text-gray-500">
                  No hay administradores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(adminToDelete)}
        title="Eliminar administrador"
        message={adminToDelete ? `¿Eliminar a ${adminToDelete.first_name || ""} ${adminToDelete.last_name || ""}?` : ""}
        confirmText="Eliminar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setAdminToDelete(null)}
      />
    </div>
  );
}
