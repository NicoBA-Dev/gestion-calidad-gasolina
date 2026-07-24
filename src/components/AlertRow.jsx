import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const TIPO_LABEL = {
  CRITICO: { text: 'Crítico', color: 'bg-red-100 text-status-critical' },
  BAJO: { text: 'Bajo', color: 'bg-amber-100 text-status-warning' },
  FALLA: { text: 'Falla', color: 'bg-red-100 text-status-critical' },
  TIMEOUT: { text: 'Timeout', color: 'bg-red-100 text-status-critical' },
  DRIFT: { text: 'Desvío', color: 'bg-amber-100 text-status-warning' },
}

const ESTADO_LABEL = {
  activa: { text: 'Sin revisar', color: 'bg-red-50 text-status-critical border-status-critical' },
  reconocida: { text: 'En seguimiento', color: 'bg-amber-50 text-status-warning border-status-warning' },
}

function construirMensaje(mensajeOriginal, surtidorNombre, surtidor) {
  const base = mensajeOriginal
    .replace(/\s*\(\d+(\.\d+)?%\)/, '')
    .replace(` - ${surtidorNombre}`, '')
    .replace(surtidorNombre, '')
    .trim()

  if (surtidor && typeof surtidor.porcentaje === 'number') {
    return `${base} (${surtidor.porcentaje}% actual)`
  }
  return base
}

export function AlertRow({ alerta, surtidor, onResolved }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const tipo = TIPO_LABEL[alerta.tipo] ?? { text: alerta.tipo, color: 'bg-gray-100 text-gray-500' }
  const estadoInfo = ESTADO_LABEL[alerta.estado]
  const mensaje = construirMensaje(alerta.mensaje, alerta.surtidorNombre, surtidor)

  const actualizar = async (nuevoEstado) => {
    const payload = { estado: nuevoEstado }
    if (nuevoEstado === 'resuelta') {
      payload.resuelta_at = new Date().toISOString()
      payload.resuelta_por = user.id
    }
    const { error } = await supabase.from('alertas').update(payload).eq('id', alerta.id)
    if (error) {
      showToast('error', 'No se pudo actualizar la alerta', error.message)
    } else {
      showToast('success', nuevoEstado === 'resuelta' ? 'Alerta resuelta' : 'Alerta en seguimiento', alerta.surtidorNombre)
      onResolved()
    }
  }

  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 pl-2">
        <span className={`w-2.5 h-2.5 rounded-full inline-block ${alerta.ledRojo ? 'bg-status-critical' : 'bg-status-warning'}`} />
      </td>
      <td className="py-4 text-xs font-mono text-gray-500">
        {new Date(alerta.fecha).toLocaleTimeString('es-BO')}
      </td>
      <td className="py-4 font-semibold text-sm">{alerta.surtidorNombre}</td>
      <td className="py-4">
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${tipo.color}`}>{tipo.text}</span>
        <p className="text-sm mt-1">{mensaje}</p>
      </td>
      <td className="py-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-md border ${estadoInfo.color}`}>
          {estadoInfo.text}
        </span>
      </td>
      <td className="py-4 pr-2 text-right whitespace-nowrap">
        {alerta.estado === 'activa' && (
          <button
            onClick={() => actualizar('reconocida')}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
          >
            Estoy en esto
          </button>
        )}
        {alerta.estado === 'reconocida' && (
          <button
            onClick={() => actualizar('resuelta')}
            className="text-sm bg-status-online text-white rounded-md px-3 py-1.5 hover:opacity-90"
          >
            ✓ Marcar resuelta
          </button>
        )}
      </td>
    </tr>
  )
}