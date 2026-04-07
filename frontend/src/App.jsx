import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DiseasePage  from './pages/DiseasePage'
import RealtimePage  from './pages/RealtimePage'
import InsectPage    from './pages/InsectPage'
import WeedPage      from './pages/WeedPage'
import ProfilePage   from './pages/ProfilePage'
import HomePage      from './pages/HomePage'
import LeafBackground from './components/LeafBackground'

// ── Protected Route ────────────────────────────────────
// Redirects to /login if user is not authenticated
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// ── Public Route ───────────────────────────────────────
// Redirects to /home if user is already logged in
function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/home" replace /> : children
}

// ── App Routes ─────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />

      <Route path="/register" element={
        <PublicRoute><RegisterPage /></PublicRoute>
      } />

      <Route path="/home" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />

      <Route path="/disease" element={
        <ProtectedRoute><DiseasePage /></ProtectedRoute>
      } />
      
      <Route path="/realtime" element={
        <ProtectedRoute><RealtimePage /></ProtectedRoute>
      } />

      <Route path="/insect" element={
        <ProtectedRoute><InsectPage /></ProtectedRoute>
      } />

      <Route path="/weed" element={
        <ProtectedRoute><WeedPage /></ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />

      {/* Catch all unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

// ── Root App ───────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: '14px' },
          }}
        />
        <LeafBackground />
        <div className="relative z-10">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}