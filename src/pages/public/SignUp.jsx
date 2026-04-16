import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../services/authService";
import {
  isMinLength,
  isRequired,
  isValidDui,
  isValidEmail,
  isValidPhoneSv,
} from "../../utils/validation";

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dui: "",
    email: "",
    address: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  }

  function validate() {
    const newErrors = {};

    // Validar Nombres
    if (!isRequired(formData.firstName)) {
      newErrors.firstName = "El nombre es obligatorio";
    }

    // Validar Apellidos
    if (!isRequired(formData.lastName)) {
      newErrors.lastName = "El apellido es obligatorio";
    }

    // Validar Teléfono (Presencia + Formato 0000-0000)
    if (!isRequired(formData.phone)) {
      newErrors.phone = "El teléfono es obligatorio";
    } else if (!isValidPhoneSv(formData.phone)) {
      newErrors.phone = "Formato inválido. Use: 7777-7777";
    }

    // Validar DUI (Presencia + Formato 00000000-0)
    if (!isRequired(formData.dui)) {
      newErrors.dui = "El DUI es obligatorio.";
    } else if (!isValidDui(formData.dui)) {
      newErrors.dui = "Formato inválido. Use: 00000000-0";
    }

    // Validar Correo
    if (!isRequired(formData.email)) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido.";
    }

    // Validar Dirección
    if (!isRequired(formData.address)) {
      newErrors.address = "La dirección de residencia es obligatoria.";
    }

    // Validar Contraseña
    if (!isRequired(formData.password)) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (!isMinLength(formData.password, 6)) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      navigate("/login", { state: { message: "Cuenta creada exitosamente. Inicia sesión." } });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-light)] px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden md:grid md:grid-cols-2">

        <div className="hidden md:flex flex-col justify-center items-center bg-[var(--color-oxford-navy)] text-white p-12">
          <h2 className="text-4xl font-bold mb-4 text-center">
            ¡Únete a SivarCuponera!
          </h2>
          <p className="text-lg text-gray-200 text-center">
            Registrarte es rápido y fácil. Empieza a ahorrar hoy.
          </p>
        </div>

        <div className="w-full p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-oxford-navy)]">
              Crear Cuenta
            </h1>
            <p className="text-gray-500 mt-2">
              Completa el formulario para registrarte
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="7777-7777"
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DUI
                </label>
                <input
                  type="text"
                  name="dui"
                  value={formData.dui}
                  onChange={handleChange}
                  placeholder="00000000-0"
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.dui ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.dui && (
                  <p className="text-red-500 text-xs mt-1">{errors.dui}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@email.com"
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.email ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.address ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
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
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${errors.password ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
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
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] hover:opacity-90 text-white font-semibold py-3 rounded-lg transition duration-200 hover:cursor-pointer disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Crear Cuenta"}
            </button>

          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">
              Inicia Sesión
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}