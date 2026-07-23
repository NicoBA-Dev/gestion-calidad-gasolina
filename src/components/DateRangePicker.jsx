export function DateRangePicker({ desde, hasta, onDesde, onHasta }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-3 flex items-center gap-3">
      <span className="text-xs font-mono text-gray-400">RANGO DE FECHAS</span>
      <input
        type="date"
        value={desde}
        onChange={(e) => onDesde(e.target.value)}
        className="text-sm border border-gray-200 rounded px-2 py-1"
      />
      <span className="text-gray-400">—</span>
      <input
        type="date"
        value={hasta}
        onChange={(e) => onHasta(e.target.value)}
        className="text-sm border border-gray-200 rounded px-2 py-1"
      />
    </div>
  )
}