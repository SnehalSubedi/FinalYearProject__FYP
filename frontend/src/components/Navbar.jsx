import { useAuth } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo / App Name */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-bold text-primary-700 text-lg tracking-tight">
            PlantGuard
          </span>
        </div>

        {/* Navigation Links */}
        {user && (
          <div className="flex items-center gap-6">
            <Link
              to="/disease"
              className={`text-sm font-medium transition-colors ${
                isActive('/disease')
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Disease Detection
            </Link>
            <Link
              to="/realtime"
              className={`text-sm font-medium transition-colors ${
                isActive('/realtime')
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Real-Time Detection
            </Link>
            <Link
              to="/insect"
              className={`text-sm font-medium transition-colors ${
                isActive('/insect')
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Insect Detection
            </Link>
            <Link
              to="/weed"
              className={`text-sm font-medium transition-colors ${
                isActive('/weed')
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weed Detection
            </Link>
          </div>
        )}

        {/* Right side — user info + logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Logged in as{' '}
              <span className="font-semibold text-gray-800">{user.full_name}</span>
            </div>
            <button
              onClick={logout}
              className="text-sm bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-1.5 rounded-lg transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}