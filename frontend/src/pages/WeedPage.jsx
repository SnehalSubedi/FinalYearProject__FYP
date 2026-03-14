import { useState, useRef, useCallback, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import toast from 'react-hot-toast'

// ─── Bounding Box Overlay ─────────────────────────────────
function BoundingBoxOverlay({ predictions, imageSize, containerSize }) {
  if (!predictions?.length || !imageSize || !containerSize) return null

  const scaleX = containerSize.width / imageSize.width
  const scaleY = containerSize.height / imageSize.height

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
      {predictions.map((pred, i) => {
        const x = (pred.x - pred.width / 2) * scaleX
        const y = (pred.y - pred.height / 2) * scaleY
        const w = pred.width * scaleX
        const h = pred.height * scaleY
        const color = pred.color
        const label = `${pred.label} ${pred.confidence}%`

        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h}
              fill="none" stroke={color} strokeWidth="2.5"
              strokeDasharray={pred.label === 'Weed' ? '6,3' : 'none'}
              rx="3"
            />
            <rect x={x} y={y - 22} width={label.length * 7.5 + 10} height={20}
              fill={color} rx="3" opacity="0.9" />
            <text x={x + 5} y={y - 7} fill="white" fontSize="11" fontWeight="bold">
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Summary Cards ────────────────────────────────────────
function SummaryBar({ summary }) {
  if (!summary) return null
  const { weeds, crops, weed_percentage } = summary

  const items = [
    { label: 'Weeds Detected', value: weeds, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    { label: 'Crops Detected', value: crops, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    { label: 'Weed Coverage', value: `${weed_percentage}%`, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      {items.map((item) => (
        <div key={item.label} className={`rounded-xl border p-3 text-center ${item.bg}`}>
          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          <div className="text-xs text-gray-500 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────
export default function WeedPage() {
  const [mode, setMode] = useState('upload')   // "upload" | "realtime"
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [imageSize, setImageSize] = useState(null)
  const [containerSize, setContainerSize] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // Real-time state
  const [isStreaming, setIsStreaming] = useState(false)
  const [confidence, setConfidence] = useState(0.3)
  const [streamStats, setStreamStats] = useState(null)
  const [streamPredictions, setStreamPredictions] = useState([])

  const fileInputRef = useRef(null)
  const imgRef = useRef(null)
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const wsRef = useRef(null)

  // ── Upload: Handle file selection ──────────────────────
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
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    const img = new Image()
    img.onload = () => setImageSize({ width: img.width, height: img.height })
    img.src = previewUrl
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      fileInputRef.current.files = e.dataTransfer.files
      handleFileChange({ target: { files: [file] } })
    }
  }

  // ── Upload: Submit to API ──────────────────────────────
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
      const res = await api.post('/weed/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      toast.success('Weed detection complete!')
    } catch (err) {
      const message = err.response?.data?.detail || 'Detection failed. Try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // ── Upload: Reset ──────────────────────────────────────
  const handleReset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setImageSize(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Real-time: Start WebSocket ─────────────────────────
  const startStream = useCallback(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      toast.error('Please log in first.')
      return
    }

    const wsUrl = `ws://localhost:8000/api/v1/weed/stream?token=${token}&confidence=${confidence}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setIsStreaming(true)
      setStreamPredictions([])
      setStreamStats(null)
      toast.success('Connected to weed detection stream')
    }

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data)
          if (data.error) {
            toast.error(data.error)
            stopStream()
            return
          }
          setStreamStats({
            frame_id: data.frame_id,
            detections: data.detections,
            summary: data.summary,
          })
          setStreamPredictions(data.predictions || [])
        } catch { /* ignore parse errors */ }
      } else if (event.data instanceof Blob) {
        // Binary JPEG frame → draw on canvas
        const url = URL.createObjectURL(event.data)
        const img = new Image()
        img.onload = () => {
          const canvas = canvasRef.current
          if (canvas) {
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
          }
          URL.revokeObjectURL(url)
        }
        img.src = url
      }
    }

    ws.onclose = () => {
      setIsStreaming(false)
    }

    ws.onerror = () => {
      toast.error('WebSocket connection error')
      setIsStreaming(false)
    }
  }, [confidence])

  const stopStream = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsStreaming(false)
    setStreamStats(null)
    setStreamPredictions([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopStream()
  }, [stopStream])

  // Update container size on resize
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      setContainerSize({ width: el.offsetWidth, height: el.offsetHeight })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [preview, isStreaming])

  // ── Mode switch ────────────────────────────────────────
  const switchMode = (m) => {
    stopStream()
    handleReset()
    setMode(m)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Crop & Weed Detection</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Detect unwanted weeds in your crop fields using AI — from image or real-time IP camera.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit mx-auto">
          {[
            { key: 'upload', label: '📷 Image Upload' },
            { key: 'realtime', label: '🎥 Real-Time Camera' },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => switchMode(m.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === m.key
                  ? 'bg-green-600 text-white shadow'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="card space-y-6">

          {/* ── Upload Mode ─────────────────────────────── */}
          {mode === 'upload' && (
            <>
              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all duration-200"
              >
                {preview ? (
                  <div ref={containerRef} className="relative">
                    <img
                      ref={imgRef}
                      src={preview}
                      alt="Field preview"
                      className="max-h-80 mx-auto rounded-lg object-contain shadow"
                      onLoad={() => {
                        if (imgRef.current) {
                          setContainerSize({
                            width: imgRef.current.offsetWidth,
                            height: imgRef.current.offsetHeight,
                          })
                        }
                      }}
                    />
                    {!loading && result && (
                      <BoundingBoxOverlay
                        predictions={result.predictions}
                        imageSize={imageSize}
                        containerSize={containerSize}
                      />
                    )}
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                        <div className="text-center">
                          <svg className="animate-spin h-8 w-8 text-green-500 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          <p className="text-green-600 font-semibold text-sm">Analyzing field...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-5xl">🌾</div>
                    <p className="text-gray-600 font-medium">Click or drag & drop a field image here</p>
                    <p className="text-gray-400 text-xs">JPEG, PNG, WebP — max 10MB</p>
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

              {/* File Name */}
              {image && (
                <p className="text-sm text-gray-500 text-center">
                  Selected: <span className="font-medium text-gray-700">{image.name}</span>
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!image || loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Analyzing...
                    </span>
                  ) : '🔍 Detect Weeds'}
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

              {/* Upload Results */}
              {result && (
                <div>
                  <SummaryBar summary={result.summary} />
                  {result.predictions.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 font-semibold mb-2">Detections</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {result.predictions.map((pred, i) => {
                          const isWeed = pred.label === 'Weed'
                          return (
                            <div
                              key={i}
                              className={`flex items-center justify-between rounded-lg px-4 py-2 border ${
                                isWeed
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-green-50 border-green-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: pred.color }} />
                                <span className={`font-semibold text-sm ${isWeed ? 'text-red-600' : 'text-green-600'}`}>
                                  {pred.label}
                                </span>
                              </div>
                              <span className="text-gray-400 text-xs">{pred.confidence}% confidence</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {result.predictions.length === 0 && (
                    <div className="mt-4 text-center py-6 text-gray-500">
                      ✅ No weeds or crops detected in this image
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── Real-Time Mode ──────────────────────────── */}
          {mode === 'realtime' && (
            <>
              {/* Confidence Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Threshold:{' '}
                  <span className="text-green-600 font-bold">{(confidence * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  disabled={isStreaming}
                  className="w-full accent-green-600"
                />
              </div>

              {/* Video Canvas */}
              <div ref={containerRef} className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video">
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-3">📹</div>
                      <p className="text-gray-400 text-sm">IP Camera stream not started</p>
                      <p className="text-gray-500 text-xs mt-1">Click "Start Stream" to begin weed detection</p>
                    </div>
                  </div>
                )}
                {isStreaming && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-white font-semibold">LIVE</span>
                  </div>
                )}
              </div>

              {/* Stream Controls */}
              <div className="flex gap-3">
                {!isStreaming ? (
                  <button
                    onClick={startStream}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                  >
                    🎥 Start Stream
                  </button>
                ) : (
                  <button
                    onClick={stopStream}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                  >
                    ⏹ Stop Stream
                  </button>
                )}
              </div>

              {/* Stream Stats */}
              {streamStats && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-700">{streamStats.frame_id}</p>
                    <p className="text-xs text-gray-500">Frame</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-700">{streamStats.detections}</p>
                    <p className="text-xs text-gray-500">Detections</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2">
                    <p className="text-lg font-bold text-yellow-600">
                      {streamStats.summary?.weed_percentage ?? 0}%
                    </p>
                    <p className="text-xs text-gray-500">Weed %</p>
                  </div>
                </div>
              )}

              {/* Stream Summary */}
              {streamStats?.summary && <SummaryBar summary={streamStats.summary} />}

              {/* Stream Detections List */}
              {streamPredictions.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold mb-2">Live Detections</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {streamPredictions.map((pred, i) => {
                      const isWeed = pred.label === 'Weed'
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between rounded-lg px-4 py-2 border ${
                            isWeed ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: pred.color }} />
                            <span className={`font-semibold text-sm ${isWeed ? 'text-red-600' : 'text-green-600'}`}>
                              {pred.label}
                            </span>
                          </div>
                          <span className="text-gray-400 text-xs">{pred.confidence}% confidence</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-4 text-sm text-gray-500 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" /> Crop (desired)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" /> Weed (unwanted)
          </div>
        </div>
      </div>
    </div>
  )
}
