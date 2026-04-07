import { useAuth } from '../context/AuthContext'
import { Link, useLocation } from 'react-router-dom'
import logoImg from '../logo/WhatsApp_Image_2026-04-06_at_14.42.44-removebg-preview-removebg-preview.png'

const LogoutIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">

        {/* Logo / App Name */}
        <Link to="/home" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src={logoImg} alt="PlantGuard" className="h-10 w-auto object-contain" />
          <span className="font-bold text-primary-700 text-xl tracking-tight">
            PlantGuard
          </span>
        </Link>

        {/* Navigation Links */}
        {user && (
          <div className="flex items-center gap-1.5">
            {[
              { to: '/home', label: 'Home' },
              { to: '/disease', label: 'Disease Detection' },
              { to: '/realtime', label: 'Real-Time Detection' },
              { to: '/insect', label: 'Insect Detection' },
              { to: '/weed', label: 'Weed Detection' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[15px] font-semibold px-4 py-2 rounded-lg transition-colors ${
                  isActive(link.to)
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        {user && (
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2 text-[15px] text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
            >
              <UserIcon />
              <span className="font-semibold text-gray-800">{user.full_name}</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-[15px] bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
