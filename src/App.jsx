import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Dispensers from './pages/Dispensers'
import POS from './pages/POS'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'
import AuditLog from './pages/AuditLog'
import { ToastProvider } from './context/ToastContext'
import { ToastContainer } from './components/ToastContainer'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout title="Panel Principal"><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/dispensers" element={<ProtectedRoute><Layout title="Gestión de Surtidores"><Dispensers /></Layout></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute><Layout title="Punto de Venta"><POS /></Layout></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Layout title="Centro de Alertas"><Alerts /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Layout title="Reportes"><Reports /></Layout></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><Layout title="Auditoría"><AuditLog /></Layout></ProtectedRoute>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App