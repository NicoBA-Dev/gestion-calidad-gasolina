import { useState } from 'react'
import { useAlertasRealtime } from '../observers/useAlertasRealtime'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { POSKeypad } from '../components/POSKeypad'
import { AuditLogPreview } from '../components/AuditLogPreview'
import { SurtidorSelector } from '../components/SurtidorSelector'
import { CopyButton } from '../components/CopyButton'


const PRECIOS = { '00': 3.74, '01': 4.79, '10': 3.72 }
const NOMBRES = { '00': 'Especial', '01': 'Premium', '10': 'Diésel' }

export default function POS() {
  const { surtidores } = useAlertasRealtime()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [surtidorId, setSurtidorId] = useState(null)
  const [litros, setLitros] = useState('')
  const [folio, setFolio] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const surtidor = surtidores.find((s) => s.id === surtidorId)
  const combustible = surtidor?.combustibleCode
  const precio = combustible ? PRECIOS[combustible] : 0
  const total = litros ? (Number(litros) * precio).toFixed(2) : '0.00'
  const excedeStock = surtidor && Number(litros) > surtidor.nivelLitros

  const handleSeleccionar = (s) => {
    setSurtidorId(s.id)
    setFolio(null)
    setError('')
  }

  const handleKey = (k) => {
    if (k === '⌫') return setLitros((l) => l.slice(0, -1))
    if (k === '.' && litros.includes('.')) return
    setLitros((l) => l + k)
  }

  const handleConfirm = async () => {
    setError('')
    if (!surtidorId) return setError('Selecciona un surtidor para continuar')
    if (!litros || Number(litros) <= 0) return setError('Ingresa la cantidad de litros')
    if (excedeStock) return setError(`Solo hay ${surtidor.nivelLitros.toLocaleString()} L disponibles en este surtidor`)

    setLoading(true)
    const ref = `TX-${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
    const { error } = await supabase.from('ventas').insert({
      surtidor_id: surtidorId,
      operador_id: user.id,
      combustible_code: combustible,
      litros: Number(litros),
      precio_unitario: precio,
      total: Number(litros) * precio,
      transaccion_ref: ref,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      showToast('error', 'No se pudo procesar la venta', error.message)
    } else {
      setFolio(ref)
      showToast('success', 'Venta registrada', `Folio ${ref} — ${Number(litros)} L por ${total} Bs`)
      setLitros('')
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div>
          <p className="text-xs font-mono text-gray-400 mb-2">1. SELECCIONA EL SURTIDOR A DESPACHAR</p>
          <SurtidorSelector surtidores={surtidores} seleccionadoId={surtidorId} onSeleccionar={handleSeleccionar} />
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-xs font-mono text-gray-400">2. INGRESA LOS LITROS</p>
            {surtidor && (
              <p className="text-xs font-mono text-gray-500">
                Máximo disponible: <span className="font-semibold">{surtidor.nivelLitros.toLocaleString()} L</span>
              </p>
            )}
          </div>
          <div className={`bg-white border rounded-md px-4 py-3 text-2xl font-mono text-right mb-3 ${excedeStock ? 'border-status-critical' : 'border-gray-200'}`}>
            {litros || '0.00'}
          </div>
          {excedeStock && (
            <p className="text-status-critical text-xs font-mono mb-3">
              ⚠ Excede el stock disponible ({surtidor.nivelLitros.toLocaleString()} L)
            </p>
          )}
          <POSKeypad onKeyPress={handleKey} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Resumen de Venta</h3>
            {folio && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{folio}</span>
                <CopyButton texto={folio} etiqueta="Folio" />
              </div>
            )}
          </div>
          <div className="text-sm space-y-1 text-gray-600">
            <p>Surtidor: <span className="font-semibold text-black">{surtidor?.nombre ?? 'Ninguno seleccionado'}</span></p>
            <p>Combustible: <span className="font-semibold text-black">{combustible ? `${NOMBRES[combustible]} (${combustible})` : '—'}</span></p>
            <p>Precio unitario: <span className="font-semibold text-black">{precio ? `${precio} Bs/L` : '—'}</span></p>
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-end">
            <span className="text-sm text-gray-400">Total</span>
            <span className="text-2xl font-bold">{total} Bs</span>
          </div>
        </div>

        <AuditLogPreview surtidorNumero={surtidor?.numero} combustibleCode={combustible} litros={litros} />

        {error && <p className="text-status-critical text-xs font-mono">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-status-online text-white font-bold py-4 rounded-md disabled:opacity-50"
        >
          {loading ? 'PROCESANDO...' : 'CONFIRMAR Y DESPACHAR'}
        </button>
      </div>
    </div>
  )
}