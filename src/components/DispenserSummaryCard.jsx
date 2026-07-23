export function DispenserSummaryCard({ surtidor, onNuevaVenta }) {
  const critico = surtidor.estado === 'critico'
  const offline = surtidor.estado === 'offline'

  return (
    <div className={`bg-white border rounded-lg shadow-sm p-4 relative overflow-hidden ${critico ? 'border-status-critical' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs font-mono text-gray-400">
            {critico ? 'SURTIDOR - CRÍTICO' : 'SURTIDOR'}
          </p>
          <h3 className="text-base font-bold">{surtidor.nombre}</h3>
        </div>
        <span
          className={`w-2.5 h-2.5 rounded-full mt-1 ${surtidor.ledRojo ? 'bg-status-critical' : surtidor.ledAmarillo ? 'bg-status-warning' : 'bg-status-online'
            }`}
        />
      </div>

      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-500">{surtidor.combustibleNombre}</span>
        <span className="font-semibold">{surtidor.porcentaje}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full mb-1">
        <div
          className={`h-2 rounded-full ${critico ? 'bg-status-critical' : surtidor.ledAmarillo ? 'bg-status-warning' : 'bg-status-online'}`}
          style={{ width: `${surtidor.porcentaje}%` }}
        />
      </div>
      <p className="text-xs font-mono text-gray-400 mb-3">Bits: {surtidor.sensorBits}</p>

      <div className="flex gap-2">
        <button
          onClick={() => onNuevaVenta(surtidor)}
          disabled={offline}
          className="flex-1 bg-black text-white text-sm rounded-md py-1.5 disabled:opacity-40"
        >
          Nueva Venta
        </button>
        <button className="flex-1 border border-gray-300 text-sm rounded-md py-1.5 hover:bg-gray-50">
          {critico ? 'Diagnóstico' : 'Recalibrar'}
        </button>
      </div>
    </div>
  )
}