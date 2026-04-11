import { useState, useEffect } from "react";
import { getEmployeesByCompany, deleteEmployeeProfile } from "../../services/employeesService";
import { createEmployee } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function EmployeesPage() {
    const { profile } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (profile?.company_id) {
            loadEmployees();
        }
    }, [profile]);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const data = await getEmployeesByCompany(profile.company_id);
            setEmployees(data);
        } catch (err) {
            console.error(err);
            setErrorMsg("Error al cargar empleados");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setErrorMsg("");
            setSuccessMsg("");
            await createEmployee({
                ...formData,
                companyId: profile.company_id,
            });
            setSuccessMsg("Empleado creado exitosamente. Es posible que debas iniciar sesión nuevamente si tu sesión se cerró.");
            setShowModal(false);
            setFormData({ firstName: "", lastName: "", email: "", password: "" });
            loadEmployees();
        } catch (error) {
            console.error(error);
            setErrorMsg(error.message || "Error al crear empleado");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar este empleado? Esto revocará su acceso.")) {
            try {
                await deleteEmployeeProfile(id);
                loadEmployees();
            } catch (error) {
                console.error(error);
                alert("Error al eliminar empleado");
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de Empleados</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                >
                    + Agregar Empleado
                </button>
            </div>

            {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}
            {successMsg && <p className="text-green-600 mb-4">{successMsg}</p>}
            <p className="text-sm text-slate-500 mb-4">En este módulo solo se permite crear y eliminar empleados.</p>

            {loading ? (
                <p>Cargando empleados...</p>
            ) : employees.length === 0 ? (
                <p>No tienes empleados registrados.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-200">
                                <th className="p-3">Nombre</th>
                                <th className="p-3">Apellido</th>
                                <th className="p-3">Rol</th>
                                <th className="p-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id} className="border-b border-slate-200">
                                    <td className="p-3">{emp.first_name}</td>
                                    <td className="p-3">{emp.last_name}</td>
                                    <td className="p-3 text-slate-500">Empleado</td>
                                    <td className="p-3 text-sm">
                                        {/* Al ser Auth de Supabase, cambiar contraseñas u otros datos requiere más controles. Para el ejemplo, borramos */}
                                        <button
                                            onClick={() => handleDelete(emp.id)}
                                            className="text-red-500 hover:text-red-700 font-semibold"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Agregar Empleado</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Nombre</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Apellido</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Correo electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full border p-2 rounded"
                                    required
                                    minLength="6"
                                />
                            </div>
                            <p className="text-xs text-slate-500">
                                Añade a un empleado
                            </p>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-white px-4 py-2 rounded"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
