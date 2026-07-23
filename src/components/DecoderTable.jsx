const FILAS = [
  { c1: 0, c0: 0, activo: 'y0' },
  { c1: 0, c0: 1, activo: 'y1' },
  { c1: 1, c0: 0, activo: 'y2' },
  { c1: 1, c0: 1, activo: null },
]

export function DecoderTable() {
  return (
    <div className="bg-slate-900 text-white rounded-lg p-5">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold">Decodificador 2 a 4 Líneas</h3>
        <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded">MAPA LÓGICO</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Las señales de entrada (C1, C0) enrutan hacia el tipo de combustible correspondiente (Y0-Y2).
      </p>
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="text-gray-400 text-xs">
            <th className="text-left pb-2">C1</th>
            <th className="text-left pb-2">C0</th>
            <th className="text-left pb-2">Y0</th>
            <th className="text-left pb-2">Y1</th>
            <th className="text-left pb-2">Y2</th>
          </tr>
        </thead>
        <tbody>
          {FILAS.map((f, i) => (
            <tr key={i}>
              <td className="py-1">{f.c1}</td>
              <td className="py-1">{f.c0}</td>
              <td className={f.activo === 'y0' ? 'text-white font-bold' : 'text-gray-600'}>{f.activo === 'y0' ? 1 : 0}</td>
              <td className={f.activo === 'y1' ? 'text-status-critical font-bold' : 'text-gray-600'}>{f.activo === 'y1' ? 1 : 0}</td>
              <td className={f.activo === 'y2' ? 'text-white font-bold' : 'text-gray-600'}>{f.activo === 'y2' ? 1 : 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 mt-3">11 = Reserva (estado inactivo)</p>
    </div>
  )
}