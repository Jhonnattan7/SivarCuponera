import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createOffer, updateOffer, resubmitOffer } from "../../services/offersService";
import { supabase } from "../../services/supabaseClient";

export default function OfferFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        regular_price: "",
        offer_price: "",
        coupon_limit: "",
        end_date: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [offerStatus, setOfferStatus] = useState(null);
    const [rejectionReason, setRejectionReason] = useState(null);

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            loadOffer(id);
        }
    }, [id]);

    const loadOffer = async (offerId) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("offers")
                .select("*")
                .eq("id", offerId)
                .single();

            if (error) throw error;
            if (data.company_id !== profile.company_id) {
                throw new Error("No tienes permiso para editar esta oferta.");
            }

            setFormData({
                title: data.title || "",
                description: data.description || "",
                regular_price: data.regular_price || "",
                offer_price: data.offer_price || "",
                coupon_limit: data.coupon_limit || "",
                end_date: data.end_date || "",
            });
            setOfferStatus(data.status);
            setRejectionReason(data.rejection_reason);
        } catch (err) {
            console.error(err);
            setErrorMsg("Error al cargar la oferta: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!formData.title || !formData.description || !formData.regular_price || !formData.offer_price || !formData.end_date) {
            setErrorMsg("Por favor, completa los campos requeridos.");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                regular_price: parseFloat(formData.regular_price),
                offer_price: parseFloat(formData.offer_price),
                coupon_limit: parseInt(formData.coupon_limit, 10),
            };

            if (isEditMode) {
                if (offerStatus === "rejected") {
                    // Si estaba rechazada, la reenviamos para revisión
                    await resubmitOffer(id, payload);
                    alert("Oferta modificada y reenviada para revisión.");
                } else {
                    // Modificación normal (ej. pendiente de aprobación)
                    await updateOffer(id, payload);
                    alert("Oferta actualizada exitosamente.");
                }
            } else {
                // Crear nueva (estado pendiente por defecto en el servicio)
                await createOffer({
                    ...payload,
                    company_id: profile.company_id,
                });
                alert("Oferta enviada para su revisión por parte del administrador.");
            }

            navigate("/company/offers");
        } catch (err) {
            console.error(err);
            setErrorMsg("Error al guardar la oferta: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    {isEditMode ? "Editar Oferta" : "Crear Nueva Oferta"}
                </h1>
                <button
                    onClick={() => navigate("/company/offers")}
                    className="text-slate-500 hover:text-slate-700 font-medium"
                >
                    &larr; Volver
                </button>
            </div>

            {errorMsg && (
                <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
                    {errorMsg}
                </div>
            )}

            {offerStatus === "rejected" && rejectionReason && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <h3 className="text-yellow-800 font-bold">Oferta Rechazada</h3>
                    <p className="text-yellow-700 text-sm mt-1">{rejectionReason}</p>
                    <p className="text-yellow-700 text-sm mt-2 font-semibold">
                        Modifica los datos y guarda para reenviarla a revisión.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm border border-slate-200 p-6 rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título de la Oferta *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full border p-2 rounded focus:ring-primary outline-none"
                        placeholder="Ej. 50% de descuento en Hamburguesas"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción de la Oferta *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full border p-2 rounded focus:ring-primary outline-none"
                        placeholder="Detalles sobre lo que incluye, restricciones, etc."
                        required
                        disabled={loading}
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Precio Regular ($) *</label>
                        <input
                            type="number"
                            step="0.01"
                            name="regular_price"
                            value={formData.regular_price}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus:ring-primary outline-none"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Precio de Oferta ($) *</label>
                        <input
                            type="number"
                            step="0.01"
                            name="offer_price"
                            value={formData.offer_price}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus:ring-primary outline-none"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Límite de Cupones *</label>
                        <input
                            type="number"
                            name="coupon_limit"
                            value={formData.coupon_limit}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus:ring-primary outline-none"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Límite *</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus:ring-primary outline-none"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition"
                        disabled={loading}
                    >
                        {loading ? "Guardando..." : isEditMode ? (offerStatus === "rejected" ? "Reenviar Oferta" : "Guardar Cambios") : "Enviar para Revisión"}
                    </button>
                </div>
            </form>
        </div>
    );
}
