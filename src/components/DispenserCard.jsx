export function DispenserCard({ surtidor, onRecalibrate }) {
  const [b1, b0] = surtidor.sensorBits.split('')

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 w-72">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs font-mono text-gray-400">ID SURTIDOR</p>
          <h3 className="text-lg font-bold">{surtidor.nombre}</h3>
        </div>
        <span
          className={`w-2.5 h-2.5 rounded-full mt-1 ${
            surtidor.ledRojo ? 'bg-status-critical' : surtidor.ledAmarillo ? 'bg-status-warning' : 'bg-status-online'
          }`}
        />
      </div>

      <span className="inline-block text-xs font-mono px-2 py-1 rounded bg-gray-100 mb-3">
        {surtidor.combustibleCode} = {surtidor.combustibleNombre.toUpperCase()}
      </span>

      <p className="text-xs font-mono text-gray-400 mb-1">CAPACIDAD DEL TANQUE</p>
      <p className="text-sm font-semibold mb-2">
        {surtidor.nivelLitros.toLocaleString()} / {surtidor.capacidadLitros.toLocaleString()} L
      </p>
      <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
        <div
          className="h-2 bg-black rounded-full"
          style={{ width: `${surtidor.porcentaje}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <div>
          <p className="font-mono text-gray-400 mb-1">ESTADO DE SENSOR (BITS)</p>
          <div className="flex gap-1">
            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded font-mono">{b1}</span>
            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded font-mono">{b0}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-gray-400 mb-1">COMPUERTAS LÓGICAS</p>
          <p className={surtidor.ledRojo ? 'text-status-critical' : 'text-gray-400'}>Crítico (S1'·S0')</p>
          <p className={surtidor.ledAmarillo ? 'text-status-warning' : 'text-gray-400'}>Bajo (S1'·S0)</p>
        </div>
      </div>

      <button
        onClick={() => onRecalibrate(surtidor)}
        className="mt-4 w-full text-sm border border-gray-300 rounded-md py-1.5 hover:bg-gray-50"
      >
        Recalibrar
      </button>
    </div>
  )
}