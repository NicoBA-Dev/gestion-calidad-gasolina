import { useState, useCallback } from 'react'
import { ToastContext } from './ToastContextValue'

let contador = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((tipo, titulo, detalle) => {
    const id = ++contador
    setToasts((prev) => [...prev, { id, tipo, titulo, detalle }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}