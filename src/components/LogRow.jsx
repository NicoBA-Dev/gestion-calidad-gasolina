const ACCION_CONFIG = {
  INSERT: { text: 'Creación', color: 'text-status-online', border: 'border-l-status-online' },
  UPDATE: { text: 'Modificación', color: 'text-status-warning', border: 'border-l-status-warning' },
  DELETE: { text: 'Eliminación', color: 'text-status-critical', border: 'border-l-status-critical' },
}

const TABLA_LABEL = { surtidores: 'Surtidores', ventas: 'Ventas', alertas: 'Alertas' }

function tiempoRelativo(fecha) {
  const diffMs = Date.now() - new Date(fecha).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} d`
}

export function LogRow({ log }) {
  const accion = ACCION_CONFIG[log.accion] ?? { text: log.accion, color: 'text-gray-500', border: 'border-l-gray-300' }

  return (
    <tr className={`border-b border-gray-100 border-l-2 ${accion.border}`}>
      <td className="py-3 pl-3">
        <p className="text-sm">{new Date(log.fecha).toLocaleTimeString('es-BO')}</p>
        <p className="text-xs text-gray-400">{tiempoRelativo(log.fecha)}</p>
      </td>
      <td className="py-3 text-sm font-medium">{TABLA_LABEL[log.tabla] ?? log.tabla}</td>
      <td className={`py-3 text-sm font-medium ${accion.color}`}>{accion.text}</td>
      <td className="py-3 text-xs font-mono text-gray-400">{log.registroId?.slice(0, 8)}</td>
      <td className="py-3 pr-3">
        <span
          title="Este registro no fue modificado desde su creación"
          className="text-xs font-medium text-status-online bg-green-50 px-2 py-1 rounded-md whitespace-nowrap"
        >
          ✓ Sin alteraciones
        </span>
      </td>
    </tr>
  )
}