import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError('Credenciales incorrectas')
    else navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-brand-red mb-1">El Surtidor</h1>
        <p className="text-xs font-mono text-gray-400 uppercase mb-6">Cochabambino</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-gray-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-gray-500">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-brand-red"
            />
          </div>

          {error && <p className="text-status-critical text-xs font-mono">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-red text-white py-2 rounded-md font-semibold text-sm hover:bg-brand-red-dark disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}