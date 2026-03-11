import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  // Initialize user from localStorage so state persists on page refresh
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  // ── Register ──────────────────────────────────────────
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData)
    toast.success('Account created! Please log in.')
    navigate('/login')
    return res.data
  }

  // ── Login ─────────────────────────────────────────────
  const login = async (formData) => {
    const res = await api.post('/auth/login', formData)
    const { access_token, refresh_token, user } = res.data

    // Persist tokens and user info
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('user', JSON.stringify(user))

    setUser(user)
    toast.success(`Welcome back, ${user.full_name}!`)
    navigate('/disease')
  }

  // ── Logout ────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Even if the API call fails, clear local state
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
      toast.success('Logged out successfully.')
      navigate('/login')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}