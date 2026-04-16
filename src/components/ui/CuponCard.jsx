function CuponCard({ cupon }) {
    const legacyOffer = cupon?.Cupones || {}
    const offer = cupon?.offer || legacyOffer

    const titulo = offer.title || offer.titulo || 'Cupón'
    const tienda = offer.companyName || offer.Tienda || 'Tienda'
    const descripcion = offer.description || offer.descripcion || 'Sin descripción disponible'
    const image = offer.image || offer.imagen
    const expiryDate = offer.expiryDate || offer.fecha_fin

    const imageSrc = image
        ? (image.startsWith('http') ? image : `/img/${image}`)
        : null
    const estado = (cupon?.estado || '').toString().trim().toLowerCase()

    const estadoLabel = estado === 'vigente'
        ? 'Disponible'
        : estado === 'usado'
            ? 'Usado'
            : estado === 'vencido'
                ? 'Vencido'
                : 'Sin estado'

    const estadoClase = estado === 'vigente'
        ? 'bg-emerald-100 text-emerald-700'
        : estado === 'usado'
            ? 'bg-slate-200 text-slate-700'
            : 'bg-amber-100 text-amber-700'

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="w-full h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none'
                        }}
                    />
                ) : (
                    <span className="text-slate-400 text-5xl font-bold">
                        {tienda?.charAt(0) || '?'}
                    </span>
                )}
            </div>

            <div className="p-5 space-y-3">
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${estadoClase}`}>
                    {estadoLabel}
                </span>

                <h3 className="text-xl font-bold text-primary leading-tight">{titulo}</h3>

                <p className="font-semibold text-oxford-navy text-lg">{tienda}</p>

                <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">{descripcion}</p>
            </div>

            <div className="px-5 pb-4 pt-2 border-t border-slate-100">
                <p className="text-sm text-slate-500 text-center">
                    Válido hasta el{' '}
                    <span className="font-semibold text-slate-700">
                        {expiryDate ? new Date(expiryDate).toLocaleDateString('es-ES') : 'N/D'}
                    </span>
                </p>
            </div>
        </div>
    )
}

export default CuponCard
