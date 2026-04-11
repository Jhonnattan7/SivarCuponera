import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const redirectMap = {
    admin: "/admin/dashboard",
    company_admin: "/company/dashboard",
    company_employee: "/empleado/canje",
    client: "/",
};

export default function LogIn() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const successMessage = location.state?.message;
    const { profile } = useAuth();

    const getLoginErrorMessage = (err) => {
        const message = err?.message?.toLowerCase?.() || "";

        if (message.includes("invalid login credentials")) {
            return "Correo o contraseña incorrectos.";
        }
        if (message.includes("email not confirmed")) {
            return "Debes confirmar tu correo antes de iniciar sesión.";
        }
        if (message.includes("too many requests")) {
            return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
        }

        return err?.message || "No se pudo iniciar sesión. Inténtalo de nuevo.";
    }

    function handleChange(e) {
        if (error) setError(null);
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        if (!formData.email.trim() || !formData.password) {
            setError("Por favor, completa todos los campos.");
            return;
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(formData.email)) {
            setError("Ingresa un correo electrónico válido.");
            return;
        }

        setLoading(true);
        try {
            const result = await login(formData.email, formData.password);
            const userProfile = result.profile;
            const from = location.state?.from?.pathname;
            navigate(from ?? redirectMap[userProfile?.role] ?? "/", { replace: true });
        } catch (err) {
            console.error(err);
            setError(getLoginErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-light)] px-4">
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden md:grid md:grid-cols-2">

                <div className="hidden md:flex flex-col justify-center items-center bg-[var(--color-oxford-navy)] text-white p-12">
                    <h2 className="text-4xl font-bold mb-4 text-center">
                        ¡Bienvenido a SivarCuponera!
                    </h2>
                    <p className="text-lg text-gray-200 text-center">
                        Inicia sesión y empieza a ahorrar en tus compras favoritas.
                    </p>
                </div>

                <div className="w-full p-8 md:p-12">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[var(--color-oxford-navy)]">
                            Iniciar Sesión
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Completa con tus datos para iniciar sesión
                        </p>
                    </div>

                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <p className="text-green-700 text-sm">{successMessage}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                placeholder="correo@email.com"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${error && !formData.email ? "border-red-500 ring-red-100" : "border-gray-300 focus:ring-[var(--color-primary)]"}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${error && !formData.password ? "border-red-500 ring-red-100" : "border-gray-300 focus:ring-[var(--color-primary)]"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592M6.18 6.18A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.96 9.96 0 01-4.293 5.067M15 12a3 3 0 00-4.243-2.828M3 3l18 18" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <div className="text-right mt-1">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-[var(--color-primary)] hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-primary)] hover:opacity-90 text-white font-semibold py-3 rounded-lg transition duration-200 hover:cursor-pointer disabled:opacity-50"
                        >
                            {loading ? "Iniciando..." : "Iniciar Sesión"}
                        </button>

                    </form>

                    <p className="text-sm text-center text-gray-500 mt-6">
                        ¿No tienes cuenta?{" "}
                        <Link to="/signup" className="text-[var(--color-primary)] font-medium cursor-pointer hover:underline">
                            Regístrate
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}