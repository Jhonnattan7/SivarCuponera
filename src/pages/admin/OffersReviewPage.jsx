import { useState, useEffect } from "react";
import { getPendingOffers, approveOffer, rejectOffer } from "../../services/offersService";

export default function OffersReviewPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el modal de rechazo
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const data = await getPendingOffers();
      setOffers(data);
    } catch (err) {
      console.error(err);
      setError("Error cargando ofertas pendientes.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm("¿Aprobar esta oferta? Se publicará inmediatamente.")) return;
    try {
      await approveOffer(id);
      // Recargar lista
      setOffers(offers.filter(o => o.id !== id));
      alert("Oferta aprobada exitosamente.");
    } catch (err) {
      alert("Error al aprobar: " + err.message);
    }
  };

  const handleRejectClick = (id) => {
    setRejectId(id);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) return alert("Debes ingresar una razón de rechazo.");
    
    try {
      await rejectOffer(rejectId, rejectReason);
      setOffers(offers.filter(o => o.id !== rejectId));
      setRejectId(null); // Cerrar modal
      alert("Oferta rechazada.");
    } catch (err) {
      alert("Error al rechazar: " + err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando ofertas pendientes...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Revisión de Ofertas</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

      {offers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <p className="text-slate-500 text-lg">No hay ofertas pendientes de aprobación.</p>
          <p className="text-sm text-slate-400">¡Buen trabajo! Todo está al día.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {offers.map((offer) => (
            <div key={offer.id} className="border rounded-lg p-6 bg-white shadow-sm flex flex-col md:flex-row gap-6">
              {/* Info de la oferta */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                   <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase">
                     {offer.companies?.name || "Empresa Desconocida"}
                   </span>
                   <span className="text-sm text-slate-400">Fecha límite: {offer.end_date}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900">{offer.title}</h3>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{offer.description}</p>
                
                <div className="flex gap-4 mt-4 text-sm">
                   <div>
                     <span className="block text-slate-400">Precio Regular</span>
                     <span className="font-medium line-through">${offer.regular_price}</span>
                   </div>
                   <div>
                     <span className="block text-slate-400">Precio Oferta</span>
                     <span className="font-bold text-green-600 text-lg">${offer.offer_price}</span>
                   </div>
                   <div>
                     <span className="block text-slate-400">Cupones</span>
                     <span className="font-medium">{offer.coupon_limit} uds.</span>
                   </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col gap-3 justify-center border-l md:pl-6 border-slate-100 min-w-[150px]">
                <button
                  onClick={() => handleApprove(offer.id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition shadow-sm text-center"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleRejectClick(offer.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded transition border border-red-200 text-center"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Casero de Rechazo */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Motivo de Rechazo</h3>
            <textarea
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none min-h-[100px]"
              placeholder="Explica por qué se rechaza esta oferta..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRejectId(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}