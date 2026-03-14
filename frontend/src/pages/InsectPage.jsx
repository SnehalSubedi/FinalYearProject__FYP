import { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function InsectPage() {
  const [image, setImage]       = useState(null)
  const [preview, setPreview]   = useState(null)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const fileInputRef            = useRef(null)

  // ── Handle image selection ─────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB.')
      return
    }

    setImage(file)
    setResult(null)
    setPreview(URL.createObjectURL(file))
  }

  // ── Handle drag & drop ─────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      fileInputRef.current.files = e.dataTransfer.files
      handleFileChange({ target: { files: [file] } })
    }
  }

  // ── Submit image to API ────────────────────────────
  const handleSubmit = async () => {
    if (!image) {
      toast.error('Please select an image first.')
      return
    }

    const formData = new FormData()
    formData.append('file', image)

    setLoading(true)
    setResult(null)

    try {
      const res = await api.post('/insect/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      toast.success('Insect detection complete!')
    } catch (err) {
      const message = err.response?.data?.detail || 'Detection failed. Try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // ── Reset everything ───────────────────────────────
  const handleReset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Insect & Pest Detection</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Upload a clear photo of a farm insect or pest to identify it and get treatment recommendations.
          </p>
        </div>

        <div className="card space-y-6">

          {/* ── Drop Zone ─────────────────────────────── */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
          >
            {preview ? (
              <img
                src={preview}
                alt="Insect preview"
                className="max-h-64 mx-auto rounded-lg object-contain shadow"
              />
            ) : (
              <div className="space-y-2">
                <div className="text-5xl">🐛</div>
                <p className="text-gray-600 font-medium">
                  Click or drag & drop an insect image here
                </p>
                <p className="text-gray-400 text-xs">
                  JPEG, PNG, WebP — max 10MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* ── File Name ─────────────────────────────── */}
          {image && (
            <p className="text-sm text-gray-500 text-center">
              Selected: <span className="font-medium text-gray-700">{image.name}</span>
            </p>
          )}

          {/* ── Action Buttons ─────────────────────────── */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!image || loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : '🔍 Detect Insect'}
            </button>

            {(image || result) && (
              <button
                onClick={handleReset}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                Reset
              </button>
            )}
          </div>

          {/* ── Result Card ────────────────────────────── */}
          {result && (
            <div className="rounded-xl p-5 border-2 bg-orange-50 border-orange-300">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🐞</span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Detection Result
                  </p>
                  <h2 className="text-xl font-bold text-orange-700">
                    {result.insect_name}
                  </h2>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Confidence</span>
                  <span className="font-semibold">{result.confidence_percentage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500 bg-orange-500"
                    style={{ width: result.confidence_percentage }}
                  />
                </div>
              </div>

              {/* Description */}
              {result.description && (
                <p className="text-sm text-gray-600 mt-3">
                  {result.description}
                </p>
              )}

              {/* Detailed Info Section */}
              <div className="mt-4 space-y-3 border-t border-orange-200 pt-4">
                {result.affected_crops && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      🌾 Affected Crops
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{result.affected_crops}</p>
                  </div>
                )}
                {result.damage && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      ⚠️ Damage
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{result.damage}</p>
                  </div>
                )}
                {result.prevention && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      🛡️ Prevention
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{result.prevention}</p>
                  </div>
                )}
                {result.treatment && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      💊 Treatment
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{result.treatment}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
