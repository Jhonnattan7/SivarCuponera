import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'

export default function Header() {
  const { session, profile } = useAuth() // Usamos el contexto global
  const [menuAbierto, setMenuAbierto] = useState(false)
  const navigate = useNavigate()

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut()
    setMenuAbierto(false)
    navigate('/login')
  }

  // Helper para mostrar nombre o email
  const displayName = profile?.first_name || session?.user?.email || "Usuario"

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight">
              Sivar<span className="text-cyan-400">Cuponera</span>
            </span>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-cyan-400 transition font-medium">
              Ofertas
            </Link>

            {session ? (
              // USUARIO LOGUEADO
              <div className="flex items-center space-x-4">
                {/* Links según rol */}
                {profile?.role === 'client' && (
                  <Link to="/client/coupons" className="hover:text-cyan-400 font-medium">
                    Mis Cupones
                  </Link>
                )}
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="text-cyan-400 hover:text-white font-bold border border-cyan-400 px-3 py-1 rounded hover:bg-cyan-600 hover:border-transparent transition">
                    Panel Admin
                  </Link>
                )}

                <div className="flex items-center space-x-3 pl-4 border-l border-slate-700">
                  <span className="text-sm text-slate-300">
                    {displayName}
                  </span>
                  <button
                    onClick={handleCerrarSesion}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition"
                  >
                    Salir
                  </button>
                </div>
              </div>
            ) : (
              // USUARIO INVITADO
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 border border-slate-600 hover:border-cyan-400 hover:text-cyan-400 rounded-lg font-medium transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition shadow-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuAbierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menú Móvil Desplegable */}
        {menuAbierto && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-slate-700 pt-4">
            <Link to="/" className="block py-2 hover:text-cyan-400" onClick={() => setMenuAbierto(false)}>
              Ofertas
            </Link>

            {session ? (
              <>
                {profile?.role === 'client' && (
                  <Link to="/client/coupons" className="block py-2 hover:text-cyan-400" onClick={() => setMenuAbierto(false)}>
                    Mis Cupones
                  </Link>
                )}
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="block py-2 text-yellow-400 font-bold" onClick={() => setMenuAbierto(false)}>
                    Ir al Panel Admin
                  </Link>
                )}
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400 mb-3">Hola, {displayName}</p>
                  <button
                    onClick={handleCerrarSesion}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-center font-medium"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 pt-2">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-2 border border-slate-600 rounded text-slate-300"
                  onClick={() => setMenuAbierto(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-center px-4 py-2 bg-cyan-600 rounded text-white"
                  onClick={() => setMenuAbierto(false)}
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}