import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function GlobalSearch({ surtidores }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const resultados = query
    ? surtidores.filter((s) =>
      s.nombre.toLowerCase().includes(query.toLowerCase()) ||
      String(s.numero).includes(query)
    )
    : []

  const irASurtidor = () => {
    setQuery('')
    navigate('/dispensers')
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar surtidor..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-white/10 placeholder-white/60 text-sm px-3 py-1.5 rounded-md border border-white/20 focus:outline-none w-56"
      />
      {resultados.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-full bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-10">
          {resultados.map((s) => (
            <button
              key={s.id}
              onClick={irASurtidor}
              className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 flex justify-between"
            >
              <span>{s.nombre}</span>
              <span className="text-gray-400">{s.combustibleNombre}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}