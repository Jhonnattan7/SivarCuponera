export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Bienvenido al Panel de Empresa</h1>
            <p className="text-slate-600">
                Desde aquí puedes gestionar tus empleados, crear nuevas ofertas y verificar el estado de las mismas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h2 className="text-xl font-semibold text-blue-800">Ofertas Activas</h2>
                    <p className="mt-2 text-3xl font-bold text-blue-600">--</p>
                </div>
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h2 className="text-xl font-semibold text-green-800">Empleados</h2>
                    <p className="mt-2 text-3xl font-bold text-green-600">--</p>
                </div>
            </div>
        </div>
    );
}
