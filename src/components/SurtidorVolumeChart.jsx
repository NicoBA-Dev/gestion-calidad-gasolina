import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function SurtidorVolumeChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.litros, 0)
  const ordenado = [...data].sort((a, b) => b.litros - a.litros)
  const lider = ordenado[0]

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <h3 className="font-bold mb-1">Demanda por Surtidor</h3>
      <p className="text-xs text-gray-400 mb-3">Litros vendidos por cada surtidor (todo el historial)</p>
      {total === 0 ? (
        <p className="text-sm text-gray-400 py-12 text-center">Aún no hay ventas registradas.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ordenado}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v.toLocaleString()} L`} />
              <Bar dataKey="litros" radius={[4, 4, 0, 0]}>
                {ordenado.map((d, i) => (
                  <Cell key={i} fill={d.nombre === lider.nombre ? '#8B1E1E' : '#CBD5E1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 mt-1">
          <strong>{lider.nombre}</strong> es el de mayor demanda ({lider.litros.toLocaleString()} L) — considerar reforzar su stock con prioridad.
          </p>
        </>
      )}
    </div>
  )
}