import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { SurtidorFactory } from '../factories/SurtidorFactory'

export function AddDispenserModal({ onClose }) {
  const [numero, setNumero] = useState('')
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('especial')
  const [capacidad, setCapacidad] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const nuevo = SurtidorFactory.crear(tipo, {
        numero: Number(numero),
        nombre,
        capacidad: capacidad ? Number(capacidad) : undefined,
      })
      const { error } = await supabase.from('surtidores').insert(nuevo)
      if (error) throw error
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">Agregar Nuevo Surtidor</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="number"
            placeholder="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Nombre (opcional)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="especial">Especial</option>
            <option value="premium">Premium</option>
            <option value="diesel">Diésel</option>
          </select>
          <input
            type="number"
            placeholder="Capacidad en litros (default 10,000)"
            value={capacidad}
            onChange={(e) => setCapacidad(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />

          {error && <p className="text-status-critical text-xs font-mono">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 rounded-md py-2 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-black text-white rounded-md py-2 text-sm disabled:opacity-50">
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}