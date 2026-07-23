import { useState } from 'react'
import { useAlertasRealtime } from '../observers/useAlertasRealtime'
import { AlertRow } from '../components/AlertRow'

const FILTROS = [
  { key: 'todas', label: 'Todas' },
  { key: 'criticas', label: 'Críticas' },
  { key: 'warnings', label: 'Avisos' },
]

export default function Alerts() {
  const { alertas, refetchAlertas } = useAlertasRealtime()
  const [filtro, setFiltro] = useState('todas')

  const visibles = alertas.filter((a) => {
    if (filtro === 'criticas') return a.ledRojo
    if (filtro === 'warnings') return a.ledAmarillo
    return true
  })

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Centro de Monitoreo Lógico</h2>
          <p className="text-sm text-gray-500">Telemetría en tiempo real y resolución de compuertas del hardware.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-3 text-right">
          <p className="text-xs font-mono text-gray-400">ALERTAS SIN RESOLVER</p>
          <p className="text-2xl font-bold text-status-critical">{String(alertas.length).padStart(2, '0')}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`text-sm px-4 py-1.5 rounded-md border ${filtro === f.key ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-mono text-gray-400 border-b border-gray-100">
              <th className="py-3 pl-2"></th>
              <th className="py-3">HORA</th>
              <th className="py-3">SURTIDOR</th>
              <th className="py-3">CONDICIÓN</th>
              <th className="py-3 pr-2 text-right">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((a) => (
              <AlertRow key={a.id} alerta={a} onResolved={refetchAlertas} />
            ))}
          </tbody>
        </table>
        {visibles.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No hay alertas en esta categoría.</p>
        )}
      </div>
    </div>
  )
}