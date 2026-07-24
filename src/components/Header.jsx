import { useAlertasRealtime } from '../observers/useAlertasRealtime'
import { GlobalSearch } from './GlobalSearch'
import { AlertBell } from './AlertBell'
import { SystemClock } from './SystemClock'

export function Header({ title = 'El Surtidor Cochabambino' }) {
  const { surtidores, alertas } = useAlertasRealtime()
  const sinRevisar = alertas.filter((a) => a.estado === 'activa').length

  return (
    <header className="bg-brand-red text-white px-6 py-4 flex items-center justify-between">
      <h2 className="font-semibold">{title}</h2>
      <div className="flex items-center gap-4">
        <SystemClock />
        <GlobalSearch surtidores={surtidores} />
        <AlertBell count={sinRevisar} />
      </div>
    </header>
  )
}