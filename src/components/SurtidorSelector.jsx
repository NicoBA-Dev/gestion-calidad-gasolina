export function SurtidorSelector({ surtidores, seleccionadoId, onSeleccionar }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {surtidores.map((s) => {
        const activo = seleccionadoId === s.id
        const sinStock = s.nivelLitros === 0

        return (
          <button
            key={s.id}
            onClick={() => onSeleccionar(s)}
            disabled={sinStock}
            className={`text-left border rounded-lg p-4 disabled:opacity-40 ${activo ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold">{s.nombre}</span>
              <span className={`w-2 h-2 rounded-full mt-1 ${s.ledRojo ? 'bg-status-critical' : s.ledAmarillo ? 'bg-status-warning' : 'bg-status-online'}`} />
            </div>
            <p className="text-xs text-gray-500 mb-1">{s.combustibleNombre}</p>
            <p className="text-sm font-mono font-semibold">
              {s.nivelLitros.toLocaleString()} L <span className="text-gray-400 font-normal">disponibles</span>
            </p>
            {sinStock && <p className="text-xs text-status-critical mt-1">Sin stock</p>}
          </button>
        )
      })}
    </div>
  )
}