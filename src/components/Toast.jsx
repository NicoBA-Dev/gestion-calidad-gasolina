const CONFIG = {
  success: { icon: '✓', color: 'border-l-status-online', bg: 'bg-white' },
  error: { icon: '✕', color: 'border-l-status-critical', bg: 'bg-white' },
  info: { icon: 'ℹ', color: 'border-l-gray-400', bg: 'bg-white' },
}

export function Toast({ tipo, titulo, detalle, onDismiss }) {
  const c = CONFIG[tipo] ?? CONFIG.info

  return (
    <div className={`${c.bg} border-l-4 ${c.color} border border-gray-200 rounded-md shadow-lg px-4 py-3 w-80 flex gap-3 items-start`}>
      <span className={`font-bold ${tipo === 'success' ? 'text-status-online' : tipo === 'error' ? 'text-status-critical' : 'text-gray-500'}`}>
        {c.icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{titulo}</p>
        {detalle && <p className="text-xs text-gray-500 mt-0.5">{detalle}</p>}
      </div>
      <button onClick={onDismiss} className="text-gray-300 hover:text-gray-500 text-sm">✕</button>
    </div>
  )
}