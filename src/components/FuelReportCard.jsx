export function FuelReportCard({ nombre, codigo, ingresos, litros, color }) {
  const formatoBs = ingresos.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const formatoLitros = litros.toLocaleString('es-BO', { maximumFractionDigits: 0 })

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <span className="font-semibold">{nombre}</span>
        </div>
        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{codigo}</span>
      </div>
      <p className="text-2xl font-bold mb-1">{formatoBs} Bs</p>
      <p className="text-xs text-gray-400">{formatoLitros} L vendidos</p>
    </div>
  )
}