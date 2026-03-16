import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategories } from "../../services/categoriesService";
import { createCompany, getCompanyById, updateCompany } from "../../services/companiesService";

export default function CompanyFormPage() {
  const { id } = useParams(); // Si existe id, es EDICIÓN
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    contact_name: "",
    phone: "",
    email: "",
    category_id: "",
    commission_pct: 0
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadCategories();
    if (id) {
      loadCompanyData(id);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      alert("Error cargando rubros");
    }
  };

  const loadCompanyData = async (companyId) => {
    try {
      const data = await getCompanyById(companyId);
      setFormData({
        name: data.name,
        code: data.code,
        address: data.address,
        contact_name: data.contact_name,
        phone: data.phone,
        email: data.email,
        category_id: data.category_id,
        commission_pct: data.commission_pct
      });
    } catch (error) {
      alert("Error cargando datos de la empresa");
      navigate("/admin/companies");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.category_id) throw new Error("Debes seleccionar un rubro");
      
      // Validación de formato de código (3 letras 3 números)
      const codeRegex = /^[A-Za-z]{3}[0-9]{3}$/;
      if (!codeRegex.test(formData.code)) {
        throw new Error("El código debe tener 3 letras seguidas de 3 números (Ej: EMP123)");
      }

      if (id) {
        await updateCompany(id, formData);
        alert("Empresa actualizada correctamente");
      } else {
        await createCompany(formData);
        alert("Empresa creada correctamente");
      }
      navigate("/admin/companies");
      
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {id ? "Editar Empresa" : "Registrar Nueva Empresa"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Datos Identificación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Código (3 letras + 3 nums)</label>
            <input
              required
              type="text"
              name="code"
              placeholder="Ej. ABC123"
              maxLength={6}
              value={formData.code}
              onChange={handleChange}
              className="mt-1 block w-full border p-2 rounded uppercase"
            />
          </div>
        </div>

        {/* Datos Contacto */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email (Usuario Admin Empresa)</label>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border p-2 rounded"
          />
          <p className="text-xs text-gray-500 mt-1">Este correo se usará para el inicio de sesión del administrador de la empresa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de Contacto</label>
            <input
              required
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              className="mt-1 block w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              required
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700">Dirección</label>
           <textarea
             required
             name="address"
             rows="2"
             value={formData.address}
             onChange={handleChange}
             className="mt-1 block w-full border p-2 rounded"
           ></textarea>
        </div>

        {/* Configuración de Negocio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rubro</label>
            <select
              required
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="mt-1 block w-full border p-2 rounded"
            >
              <option value="">-- Seleccionar --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">% Comisión por Cupón</label>
            <input
              required
              type="number"
              min="0"
              max="100"
              step="0.01"
              name="commission_pct"
              value={formData.commission_pct}
              onChange={handleChange}
              className="mt-1 block w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/companies")}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Empresa"}
          </button>
        </div>
      </form>
    </div>
  );
}