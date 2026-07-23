import { supabase } from '../lib/supabaseClient'

const TIPO_LABEL = {
  CRITICO: { text: 'FALLA', color: 'bg-red-100 text-status-critical' },
  BAJO: { text: 'AVISO', color: 'bg-amber-100 text-status-warning' },
  FALLA: { text: 'FALLA', color: 'bg-red-100 text-status-critical' },
  TIMEOUT: { text: 'TIMEOUT', color: 'bg-red-100 text-status-critical' },
  DRIFT: { text: 'DRIFT', color: 'bg-amber-100 text-status-warning' },
}

export function AlertRow({ alerta, onResolved }) {
  const tipo = TIPO_LABEL[alerta.tipo] ?? { text: alerta.tipo, color: 'bg-gray-100 text-gray-500' }

  const handleAck = async () => {
    const { error } = await supabase
      .from('alertas')
      .update({ estado: 'reconocida', resuelta_at: new Date().toISOString() })
      .eq('id', alerta.id)
    if (!error) onResolved()
  }

  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 pl-2">
        <span className={`w-2.5 h-2.5 rounded-full inline-block ${alerta.ledRojo ? 'bg-status-critical' : 'bg-status-warning'}`} />
      </td>
      <td className="py-4 text-xs font-mono text-gray-500">
        {new Date(alerta.fecha).toLocaleTimeString('es-BO')}
      </td>
      <td className="py-4">
        <p className="font-semibold text-sm">{alerta.surtidorNombre}</p>
        <p className="text-xs text-gray-400">Surtidor #{alerta.surtidorNumero}</p>
      </td>
      <td className="py-4">
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${tipo.color}`}>{tipo.text}</span>
        <p className="text-sm mt-1">{alerta.mensaje}</p>
      </td>
      <td className="py-4 pr-2 text-right">
        <button onClick={handleAck} className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50">
          ✓ Reconocer
        </button>
      </td>
    </tr>
  )
}