import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createOffer, updateOffer, resubmitOffer } from "../../services/offersService";
import { supabase } from "../../services/supabaseClient";

const STORAGE_BUCKET = "offers-images";

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
        start_date: "",
        end_date: "",
        coupon_expiry_date: "",
        IMG: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [offerStatus, setOfferStatus] = useState(null);
    const [rejectionReason, setRejectionReason] = useState(null);
    const [imageFile, setImageFile] = useState(null);

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
                start_date: data.start_date || "",
                end_date: data.end_date || "",
                coupon_expiry_date: data.coupon_expiry_date || "",
                IMG: data.IMG || "",
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

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        if (!file) {
            setImageFile(null);
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            setErrorMsg("Formato de imagen no permitido. Usa JPG, PNG o WEBP.");
            e.target.value = "";
            return;
        }

        const maxBytes = 5 * 1024 * 1024;
        if (file.size > maxBytes) {
            setErrorMsg("La imagen supera el límite de 5 MB.");
            e.target.value = "";
            return;
        }

        setErrorMsg("");
        setImageFile(file);
    };

    const uploadOfferImage = async () => {
        if (!imageFile) return formData.IMG || null;

        const fileExt = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${profile.company_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, imageFile, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            throw new Error(`No se pudo subir la imagen: ${uploadError.message}`);
        }

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
        return data.publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!formData.title || !formData.description || !formData.regular_price || !formData.offer_price || !formData.start_date || !formData.end_date || !formData.coupon_expiry_date) {
            setErrorMsg("Por favor, completa los campos requeridos.");
            return;
        }

        try {
            setLoading(true);
            const imageUrl = await uploadOfferImage();

            const payload = {
                ...formData,
                regular_price: parseFloat(formData.regular_price),
                offer_price: parseFloat(formData.offer_price),
                coupon_limit: parseInt(formData.coupon_limit, 10),
                IMG: imageUrl,
            };

            if (isEditMode) {
                if (offerStatus === "rejected") {
                    // Si estaba rechazada, la reenviamos para revisión
                    await resubmitOffer(id, payload);
                    navigate("/company/offers", {
                        state: { feedback: { type: "success", message: "Oferta modificada y reenviada para revisión." } },
                    });
                } else {
                    // Modificación normal (ej. pendiente de aprobación)
                    await updateOffer(id, payload);
                    navigate("/company/offers", {
                        state: { feedback: { type: "success", message: "Oferta actualizada exitosamente." } },
                    });
                }
            } else {
                // Crear nueva (estado pendiente por defecto en el servicio)
                await createOffer({
                    ...payload,
                    company_id: profile.company_id,
                });
                navigate("/company/offers", {
                    state: { feedback: { type: "success", message: "Oferta enviada para su revisión por parte del administrador." } },
                });
            }
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Inicio *</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
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
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vencimiento de Cupones *</label>
                        <input
                            type="date"
                            name="coupon_expiry_date"
                            value={formData.coupon_expiry_date}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus:ring-primary outline-none"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Imagen de la Oferta</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="w-full border p-2 rounded focus:ring-primary outline-none"
                            disabled={loading}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Formatos permitidos: JPG, PNG, WEBP (máximo 5 MB).
                        </p>
                        {formData.IMG && !imageFile && (
                            <p className="text-xs text-slate-500 mt-1">
                                Imagen actual cargada.
                            </p>
                        )}
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
