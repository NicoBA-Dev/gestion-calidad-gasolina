import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../hooks/useToast'

export function RecalibrateModal({ surtidor, onClose }) {
  const [nivel, setNivel] = useState(surtidor.nivelLitros)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase
      .from('surtidores')
      .update({ nivel_litros: Number(nivel) })
      .eq('id', surtidor.id)
    setLoading(false)
    if (error) {
      setError(error.message)
      showToast('error', 'No se pudo recalibrar', error.message)
    } else {
      showToast('success', 'Surtidor recalibrado', `${surtidor.nombre} ahora tiene ${Number(nivel).toLocaleString()} L`)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-1">Recalibrar</h3>
        <p className="text-xs text-gray-400 mb-4">{surtidor.nombre} — capacidad {surtidor.capacidadLitros.toLocaleString()} L</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="number"
            min="0"
            max={surtidor.capacidadLitros}
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
          />

          {error && <p className="text-status-critical text-xs font-mono">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 rounded-md py-2 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white rounded-md py-2 text-sm disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}