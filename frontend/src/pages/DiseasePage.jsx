import { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function DiseasePage() {
  const [image, setImage]       = useState(null)      // File object
  const [preview, setPreview]   = useState(null)      // Base64 preview URL
  const [result, setResult]     = useState(null)      // Prediction result
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
      const res = await api.post('/disease/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      toast.success('Prediction complete!')
    } catch (err) {
      const message = err.response?.data?.detail || 'Prediction failed. Try again.'
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
          <h1 className="text-3xl font-bold text-gray-800">Plant Disease Detection</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Upload a clear photo of a plant leaf to detect diseases instantly.
          </p>
        </div>

        <div className="card space-y-6">

          {/* ── Drop Zone ─────────────────────────────── */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-primary-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
          >
            {preview ? (
              <img
                src={preview}
                alt="Leaf preview"
                className="max-h-64 mx-auto rounded-lg object-contain shadow"
              />
            ) : (
              <div className="space-y-2">
                <div className="text-5xl">🍃</div>
                <p className="text-gray-600 font-medium">
                  Click or drag & drop a leaf image here
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
              className="btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : '🔍 Detect Disease'}
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
            <div className={`rounded-xl p-5 border-2 ${
              result.is_healthy
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">
                  {result.is_healthy ? '✅' : '⚠️'}
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Detection Result
                  </p>
                  <h2 className={`text-xl font-bold ${
                    result.is_healthy ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.disease_name}
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
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      result.is_healthy ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: result.confidence_percentage }}
                  />
                </div>
              </div>

              <p className={`text-sm mt-3 font-medium ${
                result.is_healthy ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.is_healthy
                  ? 'Your plant appears to be healthy! 🎉'
                  : 'Disease detected. See details below.'}
              </p>

              {/* Cause & Cure Section */}
              {!result.is_healthy && (
                <div className="mt-4 space-y-3 border-t border-red-200 pt-4">
                  {result.cause && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        🔬 Cause
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{result.cause}</p>
                    </div>
                  )}
                  {result.cure && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        💊 Cure / Treatment
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{result.cure}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}