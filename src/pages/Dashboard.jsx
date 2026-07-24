import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAlertasRealtime } from '../observers/useAlertasRealtime'
import { DispenserSummaryCard } from '../components/DispenserSummaryCard'
import { MetricCard } from '../components/MetricCard'
import { FuelPieChart } from '../components/FuelPieChart'
import { SurtidorVolumeChart } from '../components/SurtidorVolumeChart'

export default function Dashboard() {
  const { surtidores, alertas } = useAlertasRealtime()
  const navigate = useNavigate()
  const [porCombustible, setPorCombustible] = useState([])
  const [porSurtidor, setPorSurtidor] = useState([])

  const totalLitrosHoy = surtidores.reduce((sum, s) => sum + s.nivelLitros, 0)

  useEffect(() => {
    supabase.from('v_reporte_por_combustible').select('*').then(({ data, error }) => {
      if (!error) {
        setPorCombustible(data.map((r) => ({
          nombre: r.combustible_nombre,
          codigo: r.combustible_code,
          litros: Number(r.total_litros),
        })))
      }
    })

    supabase.from('ventas').select('litros, surtidores(nombre, numero)').then(({ data, error }) => {
      if (!error) {
        const agrupado = {}
        data.forEach((v) => {
          const nombre = v.surtidores?.nombre ?? 'Desconocido'
          agrupado[nombre] = (agrupado[nombre] ?? 0) + Number(v.litros)
        })
        setPorSurtidor(Object.entries(agrupado).map(([nombre, litros]) => ({ nombre, litros })))
      }
    })
  }, [])

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

      <div className="grid grid-cols-3 gap-5 mb-6">
        <MetricCard label="LITROS EN STOCK" value={`${totalLitrosHoy.toLocaleString()}L`} />
        <MetricCard label="SURTIDORES ONLINE" value={`${surtidores.filter(s => s.estado === 'online').length}/${surtidores.length}`} />
        <MetricCard label="ALERTAS ACTIVAS" value={alertas.length} highlight={alertas.length > 0} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <FuelPieChart data={porCombustible} />
        <SurtidorVolumeChart data={porSurtidor} />
      </div>
    </div>
  )
}