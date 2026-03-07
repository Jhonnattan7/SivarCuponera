
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function CuponCard({ oferta }) {

    const navigate = useNavigate();
    const { user } = supabase.auth.useUser();

    const redirigir = () => {
        if (user) {
            navigate('/pago-cupon', { state: { id_cupon: oferta.id_cupones, precio: oferta.precio_oferta } });
        } else {
            navigate('/login');
        }
    };
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all">

            <div className="w-full h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                {oferta.imagen ? (
                    <img
                        src={`/img/${oferta.imagen}`}
                        alt={oferta.titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = `<span class="text-slate-400 text-5xl font-bold">${oferta.Tienda?.charAt(0) || '?'}</span>`
                        }}
                    />
                ) : (
                    <span className="text-slate-400 text-5xl font-bold">
                        {oferta.Tienda?.charAt(0) || '?'}
                    </span>
                )}
            </div>

            <div className="p-5 space-y-3">

                {descuento > 0 && (
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${getEtiquetaColor()}`}>
                        Ahorra {descuento}%
                    </span>
                )}
                <h3 className="text-xl font-bold text-primary leading-tight">
                    {oferta.titulo}
                </h3>

                <p className="font-semibold text-oxford-navy text-lg">
                    {oferta.Tienda || 'Tienda'}
                </p>

                <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                    {oferta.descripcion}
                </p>
                <div className="flex items-baseline gap-3 pt-2">
                    <span className="text-slate-400 line-through text-base">
                        ${oferta.precio_regular?.toFixed(2)}
                    </span>
                    <span className="text-primary font-bold text-2xl">
                        ${oferta.precio_oferta?.toFixed(2)}
                    </span>
                </div>
                {stockBajo && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <p className="text-red-600 text-sm font-semibold text-center">
                            ¡Solo quedan {oferta.cantidad_cupon} cupones!
                        </p>
                    </div>
                )}

                {oferta.etiqueta && (
                    <span className="inline-block text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                        {oferta.etiqueta}
                    </span>
                )}
            </div>

            <div className="px-5 pb-5">
                <button
                    onClick={redirigir}
                    disabled={comprando || oferta.cantidad_cupon === 0}
                    className="w-full py-3.5 bg-oxford-navy text-white font-bold rounded-lg hover:bg-[#003366] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {comprando ? 'Procesando...' : oferta.cantidad_cupon === 0 ? 'Agotado' : 'Comprar Cupón'}
                </button>
            </div>

            <div className="px-5 pb-4 pt-2 border-t border-slate-100">
                <p className="text-sm text-slate-500 text-center">
                    Válido hasta el <span className="font-semibold text-slate-700">{new Date(oferta.fecha_fin).toLocaleDateString('es-ES')}</span>
                </p>
                <p className="text-xs text-slate-400 text-center mt-1">
                    {diasRestantes} días restantes
                </p>
            </div>
        </div>
    )
}

export default CuponCard;
