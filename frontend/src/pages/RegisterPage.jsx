import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import PlantScene from '../components/PlantScene'

const UserPlusIcon = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
)

const PhoneIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
)

const ShieldIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

export default function RegisterPage() {
  const { sendOtp, verifyOtp } = useAuth()

  // Step 1: Registration form, Step 2: OTP verification
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
  })

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef([])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  // Only allow digits for phone, max 10
  const handlePhoneChange = (e) => {
    const v = e.target.value.replace(/\D/g, '')
    if (v.length <= 10) {
      setForm({ ...form, phone: v })
    }
  }

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault()
    const { full_name, email, username, password, phone } = form

    if (!full_name || !email || !username || !password || !phone) {
      toast.error('Please fill in all fields.')
      return
    }

    if (phone.length !== 10 || !/^9[678]/.test(phone)) {
      toast.error('Please enter a valid Nepali phone number (e.g. 98XXXXXXXX).')
      return
    }

    setLoading(true)
    try {
      await sendOtp(form)
      toast.success(`OTP sent to +977 ${phone}`)
      setStep(2)
      setCountdown(120) // 2 minute cooldown for resend
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot connect to server. Make sure the backend is running.')
        return
      }
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        detail.forEach((d) => {
          const raw = d?.msg || 'Validation error.'
          toast.error(raw.replace(/^Value error,\s*/i, ''))
        })
      } else {
        toast.error(detail || 'Failed to send OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP.')
      return
    }

    setLoading(true)
    try {
      await verifyOtp(form.phone, otpCode)
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot connect to server. Make sure the backend is running.')
        return
      }
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        detail.forEach((d) => {
          const raw = d?.msg || 'Validation error.'
          toast.error(raw.replace(/^Value error,\s*/i, ''))
        })
      } else {
        toast.error(detail || 'OTP verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return
    setLoading(true)
    try {
      await sendOtp(form)
      toast.success(`OTP resent to +977 ${form.phone}`)
      setCountdown(120)
      setOtp(['', '', '', '', '', ''])
    } catch (err) {
      const detail = err.response?.data?.detail
      toast.error(detail || 'Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-50 to-green-100">
      {/* Left decorative panel with 3D Plant Scene */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <PlantScene />
        {/* Overlay text */}
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="max-w-md text-center text-white">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <svg className="w-10 h-10 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 .5 20 .5s-1.3 5.7-3.3 11.4A7 7 0 0 1 11 20z" />
                <path d="M6.7 17.3l5.3-5.3" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">Join PlantGuard</h2>
            <p className="text-green-100 text-lg leading-relaxed drop-shadow-md">
              Start protecting your crops with AI-powered disease detection, pest identification, and real-time monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="card w-full max-w-xl">

          {/* ──── STEP 1: Registration Form ──── */}
          {step === 1 && (
            <>
              <div className="text-center mb-10">
                <UserPlusIcon className="w-14 h-14 text-primary-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                <p className="text-gray-500 text-base mt-2">Get started with PlantGuard</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="e.g. Ram Sharma"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="e.g. ramsharma"
                      className="input-field"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ram@example.com"
                    className="input-field"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 h-[48px] bg-gray-50 border border-gray-300 rounded-xl text-base font-medium text-gray-600 shrink-0">
                      <span>🇳🇵</span>
                      <span>+977</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      placeholder="98XXXXXXXX"
                      maxLength={10}
                      className="input-field flex-1"
                      autoComplete="tel"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-1.5">
                    We'll send a verification code to this number.
                  </p>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="input-field"
                    autoComplete="new-password"
                  />
                  <p className="text-sm text-gray-400 mt-1.5">
                    Minimum 8 characters, at least 1 uppercase letter and 1 number.
                  </p>
                </div>

                <button type="submit" disabled={loading} className="btn-primary mt-3">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <PhoneIcon className="w-5 h-5" />
                      Send Verification Code
                    </span>
                  )}
                </button>
              </form>

              <p className="text-center text-base text-gray-500 mt-8">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:underline font-semibold">
                  Sign in here
                </Link>
              </p>
            </>
          )}

          {/* ──── STEP 2: OTP Verification ──── */}
          {step === 2 && (
            <>
              <div className="text-center mb-10">
                <div className="w-18 h-18 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5" style={{ width: '4.5rem', height: '4.5rem' }}>
                  <ShieldIcon className="w-9 h-9 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Verify Your Phone</h1>
                <p className="text-gray-500 text-base mt-2">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-primary-600 font-semibold text-lg mt-1">
                  +977 {form.phone}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                {/* OTP Input Boxes */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-4 text-center">
                    Enter Verification Code
                  </label>
                  <div className="flex justify-center gap-3 sm:gap-4" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-13 h-15 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        style={{ width: '3.25rem', height: '3.75rem' }}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading || otp.join('').length !== 6} className="btn-primary w-full">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShieldIcon className="w-5 h-5" />
                      Verify & Create Account
                    </span>
                  )}
                </button>

                {/* Resend & Back */}
                <div className="text-center space-y-3">
                  <p className="text-base text-gray-500">
                    Didn't receive the code?{' '}
                    {countdown > 0 ? (
                      <span className="text-gray-400">
                        Resend in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-primary-600 hover:underline font-semibold"
                      >
                        Resend OTP
                      </button>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']) }}
                    className="text-base text-gray-400 hover:text-gray-600"
                  >
                    ← Back to registration form
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
