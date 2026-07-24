import { useEffect, useState } from 'react'

export function SystemClock() {
  const [hora, setHora] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setHora(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="text-xs font-mono text-white/70 hidden md:inline">
      {hora.toLocaleTimeString('es-BO')}
    </span>
  )
}