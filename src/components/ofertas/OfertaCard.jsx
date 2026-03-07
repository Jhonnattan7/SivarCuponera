import { calcularDescuento, calcularDiasRestantes } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function OfertaCard({ oferta }) {
  const descuento = calcularDescuento(oferta.precio_regular, oferta.precio_oferta);
  const diasRestantes = calcularDiasRestantes(oferta.fecha_fin);
  const stockBajo = oferta.cantidad_cupon <= 5;
  const navigate = useNavigate();

  const getEtiquetaColor = () => {
    if (descuento >= 50) return 'bg-red-100 text-red-700';
    if (descuento >= 30) return 'bg-orange-100 text-orange-700';
    if (descuento >= 20) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="w-full sm:w-32 sm:h-32 h-48 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
          {oferta.imagen ? (
            <img
              src={`/img/${oferta.imagen}`}
              alt={oferta.titulo}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = `<span class="text-slate-400 text-4xl font-bold">${oferta.Tienda?.charAt(0) || '?'}</span>`
              }}
            />
          ) : (
            <span className="text-slate-400 text-4xl font-bold">
              {oferta.Tienda?.charAt(0) || '?'}
            </span>
          )}
        </div>

        <div className="flex-1 w-full space-y-2">
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

          <p className="text-sm text-slate-600 line-clamp-2">
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
            <p className="text-red-600 text-xs font-medium mt-2">
              ¡Solo quedan {oferta.cantidad_cupon} cupones!
            </p>
          )}

        </div>
      </div>

      <button
        className="w-full mt-4 py-3 sm:py-3.5 bg-oxford-navy text-white font-bold rounded-lg hover:bg-[#003366] transition-colors text-sm sm:text-base"
        onClick={() => navigate('/pago-cupon', { 
          state: { 
            id_cupon: oferta.id_cupones,
            precio: oferta.precio_oferta 
          } 
        })}
      >
        Comprar Cupón
      </button>

      <p className="text-xs sm:text-sm text-slate-400 text-center mt-2">
        Válido hasta el {new Date(oferta.fecha_fin).toLocaleDateString('es-ES')}
        ({diasRestantes} días restantes)
      </p>
    </div>
  )
}