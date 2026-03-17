import { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/categoriesService";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para formulario
  const [formData, setFormData] = useState("");
  const [editingId, setEditingId] = useState(null); // Si es null, estamos creando. Si tiene ID, editando.
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError("Error al cargar rubros.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.trim()) return;

    try {
      if (editingId) {
        // MODO EDICIÓN
        await updateCategory(editingId, formData);
        alert("Rubro actualizado correctamente");
      } else {
        // MODO CREACIÓN
        await createCategory(formData);
        alert("Rubro creado correctamente");
      }
      setFormData("");
      setEditingId(null);
      loadCategories();
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  const handleEditClick = (cat) => {
    setEditingId(cat.id);
    setFormData(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData("");
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar rubro "${name}"?`)) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert("No se pudo eliminar (quizás ya tiene empresas asociadas).");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de Rubros</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

      {/* Formulario Reutilizable (Crear / Editar) */}
      <form onSubmit={handleSubmit} className={`flex gap-4 mb-8 items-end p-4 rounded-lg border ${editingId ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50'}`}>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {editingId ? "Editar Rubro" : "Nuevo Rubro"}
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej. Tecnología, Salud, Restaurantes..."
            value={formData}
            onChange={(e) => setFormData(e.target.value)}
          />
        </div>
        
        {editingId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={!formData.trim()}
          className={`${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 rounded disabled:opacity-50 transition`}
        >
          {editingId ? "Actualizar" : "Agregar"}
        </button>
      </form>

      {/* Tabla */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cat.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleEditClick(cat)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}