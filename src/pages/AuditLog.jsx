import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { adaptLogs } from '../adapters/supabaseAdapter'
import { LogRow } from '../components/LogRow'

const FILTROS = [
  { key: 'todas', label: 'Todas las tablas' },
  { key: 'surtidores', label: 'Surtidores' },
  { key: 'ventas', label: 'Ventas' },
  { key: 'alertas', label: 'Alertas' },
]

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('logs_sistema')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (!error) setLogs(adaptLogs(data))
        setLoading(false)
      })
  }, [])

  const visibles = logs
    .filter((l) => filtro === 'todas' || l.tabla === filtro)
    .filter((l) => !busqueda || l.registroId?.toLowerCase().includes(busqueda.toLowerCase()))

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Registro de Auditoría</h2>
          <p className="text-sm text-gray-500">Historial de cambios en el sistema — visible solo para administradores.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-3 text-right">
          <p className="text-xs font-mono text-gray-400">REGISTROS MOSTRADOS</p>
          <p className="text-2xl font-bold">{visibles.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
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
        <input
          type="text"
          placeholder="Buscar por ID de registro..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 ml-auto w-56"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-mono text-gray-400 border-b border-gray-100">
              <th className="py-3 pl-3">HORA</th>
              <th className="py-3">TABLA</th>
              <th className="py-3">ACCIÓN</th>
              <th className="py-3">REGISTRO</th>
              <th className="py-3 pr-3">INTEGRIDAD</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((l) => (
              <LogRow key={l.id} log={l} />
            ))}
          </tbody>
        </table>
        {!loading && visibles.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Sin registros para este filtro.</p>
        )}
        {loading && <p className="text-center text-sm text-gray-400 py-8">Cargando...</p>}
      </div>

      <p className="text-xs text-gray-400 mt-3">Mostrando los últimos 200 registros del sistema.</p>
    </div>
  )
}