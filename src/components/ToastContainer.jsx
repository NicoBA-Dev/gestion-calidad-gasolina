import { useToast } from '../hooks/useToast'
import { Toast } from './Toast'

export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={() => dismissToast(t.id)} />
      ))}
    </div>
  )
}