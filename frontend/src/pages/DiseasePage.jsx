import { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import toast from 'react-hot-toast'
import logoImg from '../logo/WhatsApp_Image_2026-04-06_at_14.42.44-removebg-preview-removebg-preview.png'

// SVG Icons
const UploadIcon = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export default function DiseasePage() {
  const [image, setImage]       = useState(null)
  const [preview, setPreview]   = useState(null)
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const fileInputRef            = useRef(null)

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

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      fileInputRef.current.files = e.dataTransfer.files
      handleFileChange({ target: { files: [file] } })
    }
  }

  const handleSubmit = async () => {
    if (!image) { toast.error('Please select an image first.'); return }
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
      toast.error(err.response?.data?.detail || 'Prediction failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const confidenceValue = result ? parseFloat(result.confidence_percentage) : 0
  const getConfidenceColor = (val) => {
    if (val >= 90) return 'text-green-600'
    if (val >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }
  const getConfidenceBarColor = (val) => {
    if (val >= 90) return 'bg-green-500'
    if (val >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <img src={logoImg} alt="PlantGuard" className="h-12 w-auto object-contain hidden sm:block" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🌿 Plant Disease Detection</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Upload a clear photo of a plant leaf to detect diseases instantly using AI.
            </p>
          </div>
        </div>

        <div className={`grid gap-6 grid-cols-1 ${result ? 'lg:grid-cols-12' : 'max-w-2xl mx-auto'}`}>
          {/* Upload Section */}
          <div className={`card space-y-5 ${result ? 'lg:col-span-5' : ''}`}>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-primary-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-200 min-h-[300px] flex items-center justify-center"
            >
              {preview ? (
                <img src={preview} alt="Leaf preview" className="max-h-[360px] mx-auto rounded-lg object-contain shadow" />
              ) : (
                <div className="space-y-3">
                  <UploadIcon className="w-14 h-14 text-primary-400 mx-auto" />
                  <p className="text-gray-600 font-medium">📷 Click or drag & drop a leaf image here</p>
                  <p className="text-gray-400 text-xs">JPEG, PNG, WebP — max 10MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            </div>

            {image && (
              <p className="text-sm text-gray-500 text-center">
                📁 Selected: <span className="font-medium text-gray-700">{image.name}</span>
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={!image || loading} className="btn-primary">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <SearchIcon /> 🔍 Detect Disease
                  </span>
                )}
              </button>
              {(image || result) && (
                <button onClick={handleReset} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200">
                  🔄 Reset
                </button>
              )}
            </div>
          </div>

          {/* Right: Result Card */}
          {result && (
            <div className="lg:col-span-7 space-y-5">
              {/* Status Banner */}
              <div className={`rounded-2xl p-6 border-2 ${result.is_healthy ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{result.is_healthy ? '✅' : '⚠️'}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">🧪 Detection Result</p>
                    <h2 className={`text-2xl font-bold ${result.is_healthy ? 'text-green-700' : 'text-red-700'}`}>
                      {result.disease_name}
                    </h2>
                    <p className={`text-sm mt-1 font-medium ${result.is_healthy ? 'text-green-600' : 'text-red-600'}`}>
                      {result.is_healthy ? '🌱 Your plant appears to be healthy! Great job taking care of it.' : '🚨 Disease detected. Check the details below for treatment guidance.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence Card */}
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">📊 Confidence Score</h3>
                  <span className={`text-2xl font-bold ${getConfidenceColor(confidenceValue)}`}>{result.confidence_percentage}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full transition-all duration-700 ${result.is_healthy ? 'bg-green-500' : getConfidenceBarColor(confidenceValue)}`} style={{ width: result.confidence_percentage }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {confidenceValue >= 90 ? '🎯 High confidence — model is very sure about this prediction' :
                   confidenceValue >= 70 ? '🟡 Moderate confidence — consider uploading a clearer image' :
                   '⚠️ Low confidence — try with a better-lit, focused photo'}
                </p>
              </div>

              {/* Disease Details */}
              {!result.is_healthy && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.cause && (
                    <div className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">🦚</span>
                        <h3 className="font-semibold text-gray-800">Cause</h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{result.cause}</p>
                    </div>
                  )}
                  {result.cure && (
                    <div className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">💊</span>
                        <h3 className="font-semibold text-gray-800">Cure / Treatment</h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{result.cure}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tips Section */}
              {result.is_healthy && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <h3 className="font-semibold text-green-800 mb-2">🌟 Tips to Keep Your Plant Healthy</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>💧 Water regularly but avoid overwatering</li>
                    <li>☀️ Ensure adequate sunlight exposure</li>
                    <li>🪴 Use nutrient-rich soil and proper fertilizers</li>
                    <li>🐛 Monitor for pests and insects regularly</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
