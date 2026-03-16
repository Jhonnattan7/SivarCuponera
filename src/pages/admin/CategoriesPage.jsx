import { useEffect, useState } from "react";
import { getCategories, createCategory, deleteCategory } from "../../services/categoriesService";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState(null);

  // Cargar rubros al iniciar
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError("Error al cargar rubros: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear rubro
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await createCategory(newCategory);
      setNewCategory("");
      loadCategories(); // Recargar lista
      alert("Rubro creado exitosamente");
    } catch (err) {
      alert("Error al crear: " + err.message);
    }
  };

  // Eliminar rubro
  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar el rubro "${name}"?`)) return;

    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert("No se pudo eliminar (quizás ya tiene empresas asociadas).");
    }
  };

  if (loading && categories.length === 0) return <p className="p-4">Cargando rubros...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de Rubros</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

      {/* Formulario de Creación */}
      <form onSubmit={handleCreate} className="flex gap-4 mb-8 items-end bg-slate-50 p-4 rounded-lg border">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nuevo Rubro
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej. Tecnología, Salud, Restaurantes..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={!newCategory.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Agregar
        </button>
      </form>

      {/* Tabla de Rubros */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cat.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                  No hay rubros registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}