import { useNavigate } from 'react-router-dom'
import { useAlertasRealtime } from '../observers/useAlertasRealtime'
import { DispenserSummaryCard } from '../components/DispenserSummaryCard'
import { MetricCard } from '../components/MetricCard'

export default function Dashboard() {
  const { surtidores, alertas } = useAlertasRealtime()
  const navigate = useNavigate()

  const totalLitrosHoy = surtidores.reduce((sum, s) => sum + s.nivelLitros, 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Surtidores Activos</h2>
        <span className="text-xs font-mono text-status-online">● SISTEMA EN LÍNEA</span>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        {surtidores.map((s) => (
          <DispenserSummaryCard key={s.id} surtidor={s} onNuevaVenta={() => navigate('/pos')} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <MetricCard label="LITROS EN STOCK" value={`${totalLitrosHoy.toLocaleString()}L`} />
        <MetricCard label="SURTIDORES ONLINE" value={`${surtidores.filter(s => s.estado === 'online').length}/${surtidores.length}`} />
        <MetricCard label="ALERTAS ACTIVAS" value={alertas.length} highlight={alertas.length > 0} />
      </div>
    </div>
  )
}