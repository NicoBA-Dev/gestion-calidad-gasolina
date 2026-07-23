import { useState } from 'react'
import { useAlertasRealtime } from '../observers/useAlertasRealtime'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { POSKeypad } from '../components/POSKeypad'
import { AuditLogPreview } from '../components/AuditLogPreview'

const PRECIOS = { '00': 3.74, '01': 4.79, '10': 3.72 }
const NOMBRES = { '00': 'Especial', '01': 'Premium', '10': 'Diésel' }

export default function POS() {
  const { surtidores } = useAlertasRealtime()
  const { user } = useAuth()
  const [surtidorId, setSurtidorId] = useState(null)
  const [combustible, setCombustible] = useState('00')
  const [litros, setLitros] = useState('')
  const [folio, setFolio] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const surtidor = surtidores.find((s) => s.id === surtidorId)
  const precio = PRECIOS[combustible]
  const total = litros ? (Number(litros) * precio).toFixed(2) : '0.00'

  const handleKey = (k) => {
    if (k === '⌫') return setLitros((l) => l.slice(0, -1))
    if (k === '.' && litros.includes('.')) return
    setLitros((l) => l + k)
  }

  const handleConfirm = async () => {
    setError('')
    if (!surtidorId || !litros || Number(litros) <= 0) {
      setError('Selecciona un surtidor e ingresa los litros')
      return
    }
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
    if (error) setError(error.message)
    else {
      setFolio(ref)
      setLitros('')
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div>
          <p className="text-xs font-mono text-gray-400 mb-2">SELECCIONAR SURTIDOR</p>
          <div className="grid grid-cols-4 gap-3">
            {surtidores.map((s) => (
              <button
                key={s.id}
                onClick={() => setSurtidorId(s.id)}
                className={`py-3 rounded-md font-semibold ${surtidorId === s.id ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                P{s.numero}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-mono text-gray-400 mb-2">TIPO DE COMBUSTIBLE</p>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(NOMBRES).map(([code, nombre]) => (
              <button
                key={code}
                onClick={() => setCombustible(code)}
                className={`py-4 rounded-md border text-left px-4 ${combustible === code ? 'border-black bg-gray-50' : 'border-gray-200'
                  }`}
              >
                <p className="font-semibold">{nombre}</p>
                <p className="text-xs text-gray-400">CÓDIGO: {code}</p>
                <p className="text-sm">{PRECIOS[code]} Bs/L</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-mono text-gray-400 mb-2">LITROS INGRESADOS</p>
          <div className="bg-white border border-gray-200 rounded-md px-4 py-3 text-2xl font-mono text-right mb-3">
            {litros || '0.00'}
          </div>
          <POSKeypad onKeyPress={handleKey} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Resumen de Venta</h3>
            {folio && <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{folio}</span>}
          </div>
          <div className="text-sm space-y-1 text-gray-600">
            <p>Surtidor: <span className="font-semibold text-black">{surtidor?.nombre ?? '—'}</span></p>
            <p>Combustible: <span className="font-semibold text-black">{NOMBRES[combustible]} ({combustible})</span></p>
            <p>Precio unitario: <span className="font-semibold text-black">{precio} Bs/L</span></p>
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