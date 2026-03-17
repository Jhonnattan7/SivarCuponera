import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getOffersByCompany, discardOffer } from "../../services/offersService";

export default function OffersPage() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (profile?.company_id) {
            loadOffers();
        }
    }, [profile]);

    const loadOffers = async () => {
        try {
            setLoading(true);
            const data = await getOffersByCompany(profile.company_id);
            setOffers(data || []);
        } catch (error) {
            console.error("Error al cargar ofertas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDiscard = async (id) => {
        if (window.confirm("¿Seguro que deseas descartar esta oferta?")) {
            try {
                await discardOffer(id);
                loadOffers();
            } catch (error) {
                console.error("Error al descartar:", error);
                alert("No se pudo descartar la oferta.");
            }
        }
    };

    const filteredOffers = offers.filter((o) => {
        if (filter === "all") return true;
        return o.status === filter;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Mis Ofertas</h1>
                <Link
                    to="/company/offers/new"
                    className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-semibold"
                >
                    + Nueva Oferta
                </Link>
            </div>

            <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-2">
                {["all", "pending_approval", "approved", "rejected", "discarded"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${filter === status
                                ? "bg-slate-800 text-white"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                    >
                        {status === "all" ? "Todas" :
                            status === "pending_approval" ? "Pendientes" :
                                status === "approved" ? "Aprobadas" :
                                    status === "rejected" ? "Rechazadas" : "Descartadas"}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-slate-500">Cargando...</p>
            ) : filteredOffers.length === 0 ? (
                <p className="text-slate-500 text-center py-10">No hay ofertas en esta categoría.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOffers.map((offer) => (
                        <div key={offer.id} className="border border-slate-200 rounded-lg p-5 shadow-sm bg-white relative">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{offer.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${offer.status === "approved" ? "bg-green-100 text-green-800" :
                                        offer.status === "pending_approval" ? "bg-yellow-100 text-yellow-800" :
                                            offer.status === "rejected" ? "bg-red-100 text-red-800" :
                                                "bg-gray-100 text-gray-800"
                                    }`}>
                                    {offer.status === "pending_approval" ? "Pendiente" :
                                        offer.status === "approved" ? "Aprobada" :
                                            offer.status === "rejected" ? "Rechazada" : "Descartada"}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{offer.description}</p>

                            {offer.status === "rejected" && offer.rejection_reason && (
                                <div className="bg-red-50 text-red-700 p-2 rounded text-xs mb-4">
                                    <strong>Razón del rechazo:</strong> {offer.rejection_reason}
                                </div>
                            )}

                            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-100">
                                {/* Permite editar y reenviar: */}
                                {(offer.status === "pending_approval" || offer.status === "rejected") && (
                                    <Link
                                        to={`/company/offers/${offer.id}/edit`}
                                        className="text-primary hover:text-blue-800 font-medium text-sm px-3 py-1 border border-primary rounded"
                                    >
                                        {offer.status === "rejected" ? "Modificar y Reenviar" : "Editar"}
                                    </Link>
                                )}
                                {offer.status === "rejected" && (
                                    <button
                                        onClick={() => handleDiscard(offer.id)}
                                        className="text-red-500 hover:text-red-700 font-medium text-sm px-3 py-1 border border-red-500 rounded"
                                    >
                                        Descartar
                                    </button>
                                )}
                                {offer.status === "approved" && (
                                    <span className="text-xs text-slate-400">Oferta Activa</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
