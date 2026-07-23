import { useState } from 'react'

const ESTADO_HUMANO = {
  critico: { texto: 'Crítico — requiere reabastecimiento', color: 'text-status-critical', bg: 'bg-red-50' },
  online: { texto: 'Operando con normalidad', color: 'text-status-online', bg: 'bg-green-50' },
  mantenimiento: { texto: 'En mantenimiento', color: 'text-gray-500', bg: 'bg-gray-50' },
  offline: { texto: 'Fuera de línea', color: 'text-gray-400', bg: 'bg-gray-50' },
}

export function DispenserCard({ surtidor, onRecalibrate }) {
  const [verDetalle, setVerDetalle] = useState(false)
  const [b1, b0] = surtidor.sensorBits.split('')
  const estado = ESTADO_HUMANO[surtidor.estado] ?? ESTADO_HUMANO.online
  const alertaAmarilla = surtidor.ledAmarillo && surtidor.estado !== 'critico'

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 w-72">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-lg font-bold">{surtidor.nombre}</h3>
        <span
          className={`w-2.5 h-2.5 rounded-full mt-1 ${surtidor.ledRojo ? 'bg-status-critical' : surtidor.ledAmarillo ? 'bg-status-warning' : 'bg-status-online'
            }`}
        />
      </div>
      <p className="text-sm text-gray-500 mb-3">Combustible: {surtidor.combustibleNombre}</p>

      <p className="text-sm font-semibold mb-1">
        {surtidor.nivelLitros.toLocaleString()} / {surtidor.capacidadLitros.toLocaleString()} L
        <span className="text-gray-400 font-normal"> ({surtidor.porcentaje}%)</span>
      </p>
      <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
        <div
          className={`h-2 rounded-full ${surtidor.ledRojo ? 'bg-status-critical' : alertaAmarilla ? 'bg-status-warning' : 'bg-status-online'}`}
          style={{ width: `${surtidor.porcentaje}%` }}
        />
      </div>

      <div className={`text-sm font-medium px-3 py-2 rounded-md mb-3 ${estado.bg} ${estado.color}`}>
        {estado.texto}
      </div>

      <button
        onClick={() => setVerDetalle((v) => !v)}
        className="text-xs text-gray-400 hover:text-gray-600 mb-2"
      >
        {verDetalle ? '▲ Ocultar detalle técnico' : '▼ Ver detalle técnico'}
      </button>

      {verDetalle && (
        <div className="flex justify-between text-xs bg-gray-50 rounded-md p-3 mb-3">
          <div>
            <p className="font-mono text-gray-400 mb-1">SENSOR (BITS)</p>
            <div className="flex gap-1">
              <span className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded font-mono">{b1}</span>
              <span className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded font-mono">{b0}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-gray-400 mb-1">COMPUERTAS LÓGICAS</p>
            <p className={surtidor.ledRojo ? 'text-status-critical' : 'text-gray-400'}>Crítico (S1'·S0')</p>
            <p className={alertaAmarilla ? 'text-status-warning' : 'text-gray-400'}>Bajo (S1'·S0)</p>
          </div>
        </div>
      )}

      {onRecalibrate && (
        <button
          onClick={() => onRecalibrate(surtidor)}
          className="w-full text-sm border border-gray-300 rounded-md py-1.5 hover:bg-gray-50"
        >
          Recalibrar nivel
        </button>
      )}
    </div>
  )
}