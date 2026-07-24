import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = { '00': '#334155', '01': '#B45309', '10': '#0F766E' }

export function FuelPieChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.litros, 0)
  const lider = [...data].sort((a, b) => b.litros - a.litros)[0]

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <h3 className="font-bold mb-1">Combustible Más Vendido</h3>
      <p className="text-xs text-gray-400 mb-3">Distribución de litros vendidos (todo el historial)</p>
      {total === 0 ? (
        <p className="text-sm text-gray-400 py-12 text-center">Aún no hay ventas registradas.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart margin={{ top: 10, right: 40, left: 40, bottom: 10 }}>
              <Pie
                data={data}
                dataKey="litros"
                nameKey="nombre"
                outerRadius={75}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={COLORS[d.codigo] ?? '#999'} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v.toLocaleString()} L`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 mt-1">
          <strong>{lider.nombre}</strong> lidera la demanda con el {((lider.litros / total) * 100).toFixed(0)}% del volumen total — priorizar su abastecimiento.
          </p>
        </>
      )}
    </div>
  )
}