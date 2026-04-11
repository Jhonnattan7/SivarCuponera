import { calcularDescuento, calcularDiasRestantes } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

export default function OfertaCard({ oferta }) {
  const descuento = calcularDescuento(oferta.regular_price, oferta.offer_price);
  const diasRestantes = calcularDiasRestantes(oferta.end_date);
  const stockBajo = oferta.coupons_available !== null && oferta.coupons_available <= 5;
  const imageSrc = oferta.IMG
    ? (oferta.IMG.startsWith('http') ? oferta.IMG : `/img/${oferta.IMG}`)
    : null;
  const navigate = useNavigate();

  const handleComprarClick = (e) => {
    e.preventDefault()
    e.stopPropagation()

    navigate('/pago-cupon', {
      state: {
        offerId: oferta.id,
        price: oferta.offer_price,
        title: oferta.title,
        companyName: oferta.company_name,
        image: oferta.IMG
      }
    })
  }

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
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={oferta.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = `<span class="text-slate-400 text-4xl font-bold">${oferta.company_name?.charAt(0) || '?'}</span>`
              }}
            />
          ) : (
            <span className="text-slate-400 text-4xl font-bold">
              {oferta.company_name?.charAt(0) || '?'}
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
            {oferta.title}
          </h3>

          <p className="font-semibold text-oxford-navy text-lg">
            {oferta.company_name || 'Tienda'}
          </p>

          <p className="text-sm text-slate-600 line-clamp-2">
            {oferta.description}
          </p>

          <div className="flex items-baseline gap-3 pt-2">
            <span className="text-slate-400 line-through text-base">
              ${oferta.regular_price?.toFixed(2)}
            </span>
            <span className="text-primary font-bold text-2xl">
              ${oferta.offer_price?.toFixed(2)}
            </span>
          </div>

          {stockBajo && (
            <p className="text-red-600 text-xs font-medium mt-2">
              ¡Solo quedan {oferta.coupons_available} cupones!
            </p>
          )}

        </div>
      </div>

      <button
        type="button"
        className="w-full mt-4 py-3 sm:py-3.5 bg-oxford-navy text-white font-bold rounded-lg hover:bg-[#003366] transition-colors text-sm sm:text-base"
        onClick={handleComprarClick}
      >
        Comprar Cupón
      </button>

      <p className="text-xs sm:text-sm text-slate-400 text-center mt-2">
        Válido hasta el {new Date(oferta.end_date).toLocaleDateString('es-ES')}
        ({diasRestantes} días restantes)
      </p>
    </div>
  )
}