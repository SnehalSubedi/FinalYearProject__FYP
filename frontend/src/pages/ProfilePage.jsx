import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const UserIcon = ({ className = 'w-20 h-20' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const SaveIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me')
      setProfile(res.data)
      setForm({
        full_name: res.data.full_name,
        email: res.data.email,
        phone: res.data.phone || '',
      })
    } catch {
      toast.error('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const updates = {}
    if (form.full_name !== profile.full_name) updates.full_name = form.full_name
    if (form.email !== profile.email) updates.email = form.email
    if (form.phone !== (profile.phone || '')) updates.phone = form.phone

    if (Object.keys(updates).length === 0) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      const res = await api.put('/auth/profile', updates)
      setProfile(res.data)
      // Update localStorage so navbar and other components reflect the change
      localStorage.setItem('user', JSON.stringify(res.data))
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone || '',
    })
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-primary-50 text-primary-600 rounded-full p-4 mb-3">
                <UserIcon />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{profile?.full_name}</h2>
              <p className="text-sm text-gray-500">@{profile?.username}</p>
            </div>

            {/* Profile Fields */}
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  />
                ) : (
                  <p className="text-gray-800 bg-gray-50 rounded-lg px-4 py-2.5 text-sm">{profile?.full_name}</p>
                )}
              </div>

              {/* Username (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                <p className="text-gray-800 bg-gray-50 rounded-lg px-4 py-2.5 text-sm">{profile?.username}</p>
                {editing && <p className="text-xs text-gray-400 mt-1">Username cannot be changed.</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  />
                ) : (
                  <p className="text-gray-800 bg-gray-50 rounded-lg px-4 py-2.5 text-sm">{profile?.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  />
                ) : (
                  <p className="text-gray-800 bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
                    {profile?.phone ? `+977 ${profile.phone}` : 'Not set'}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Account Status</label>
                <p className="bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${profile?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${profile?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {profile?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <SaveIcon /> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                >
                  <EditIcon /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
