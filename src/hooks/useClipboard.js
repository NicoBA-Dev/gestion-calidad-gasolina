import { useToast } from './useToast'

export function useClipboard() {
  const { showToast } = useToast()

  const copiar = async (texto, etiqueta = 'Texto') => {
    if (!texto) return

    if (!navigator.clipboard) {
      showToast('error', 'No se pudo copiar', 'Tu navegador no soporta esta función')
      return
    }

    try {
      await navigator.clipboard.writeText(texto)
      showToast('success', 'Copiado al portapapeles', `${etiqueta}: ${texto}`)
    } catch (err) {
      showToast('error', 'No se pudo copiar', err.message || 'Permiso denegado')
    }
  }

  return { copiar }
}