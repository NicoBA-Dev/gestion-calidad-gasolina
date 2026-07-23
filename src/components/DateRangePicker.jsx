import { useState } from 'react'

const toISO = (d) => d.toISOString().slice(0, 10)

const PRESETS = [
  { key: 'hoy', label: 'Hoy', calc: () => [toISO(new Date()), toISO(new Date())] },
  {
    key: '7d', label: 'Últimos 7 días', calc: () => {
      const d = new Date(); d.setDate(d.getDate() - 6)
      return [toISO(d), toISO(new Date())]
    }
  },
  {
    key: 'mes', label: 'Este mes', calc: () => {
      const d = new Date(); d.setDate(1)
      return [toISO(d), toISO(new Date())]
    }
  },
  {
    key: 'mesAnterior', label: 'Mes pasado', calc: () => {
      const d = new Date(); d.setMonth(d.getMonth() - 1)
      return [toISO(d), toISO(new Date())]
    }
  },
]

export function DateRangePicker({ desde, hasta, onDesde, onHasta }) {
  const [personalizado, setPersonalizado] = useState(false)

  const aplicarPreset = (preset) => {
    const [d, h] = preset.calc()
    onDesde(d)
    onHasta(h)
    setPersonalizado(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => aplicarPreset(p)}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setPersonalizado((v) => !v)}
          className={`text-sm px-3 py-1.5 rounded-md border ${personalizado ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
        >
          Rango personalizado
        </button>
      </div>

      {personalizado && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => onDesde(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => onHasta(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1.5"
            />
          </div>
        </div>
      )}

      {!personalizado && (
        <p className="text-xs text-gray-400 mt-2">
          Mostrando del {desde} al {hasta}
        </p>
      )}
    </div>
  )
}