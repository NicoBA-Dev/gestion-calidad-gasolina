import { useState } from 'react'
import { useAlertasRealtime } from '../observers/useAlertasRealtime'
import { useAuth } from '../hooks/useAuth'
import { DispenserCard } from '../components/DispenserCard'
import { AddDispenserModal } from '../components/AddDispenserModal'
import { RecalibrateModal } from '../components/RecalibrateModal'

export default function Dispensers() {
  const { surtidores } = useAlertasRealtime()
  const { profile } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const [recalibrando, setRecalibrando] = useState(null)

  const puedeAdministrar = profile?.rol === 'admin' || profile?.rol === 'manager'

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">Módulo Surtidores — Monitoreo y control en tiempo real.</p>
        {puedeAdministrar && (
          <button
            onClick={() => setShowAdd(true)}
            className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-md"
          >
            + AGREGAR SURTIDOR
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-5">
        {surtidores.map((s) => (
          <DispenserCard
            key={s.id}
            surtidor={s}
            onRecalibrate={puedeAdministrar ? setRecalibrando : null}
          />
        ))}
      </div>

      {showAdd && <AddDispenserModal onClose={() => setShowAdd(false)} />}
      {recalibrando && (
        <RecalibrateModal surtidor={recalibrando} onClose={() => setRecalibrando(null)} />
      )}
    </div>
  )
}