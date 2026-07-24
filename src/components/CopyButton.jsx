import { useClipboard } from '../hooks/useClipboard'

export function CopyButton({ texto, etiqueta, className = '' }) {
  const { copiar } = useClipboard()

  if (!texto) return null

  return (
    <button
      onClick={() => copiar(texto, etiqueta)}
      title="Copiar al portapapeles"
      className={`inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 ${className}`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
      Copiar
    </button>
  )
}