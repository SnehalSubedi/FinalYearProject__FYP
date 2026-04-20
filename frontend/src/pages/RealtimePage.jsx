import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import logoImg from '../logo/WhatsApp_Image_2026-04-06_at_14.42.44-removebg-preview-removebg-preview.png'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// SVG Icons
const VideoIcon = ({ className = 'w-14 h-14' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
  </svg>
)
const PlayIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)
const StopIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="5" y="5" rx="2" />
  </svg>
)
const WifiIcon = () => (
  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
)
const MonitorIcon = () => (
  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)
const DownloadIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const RecordIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6" />
  </svg>
)
const ChartIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="3" y1="20" x2="21" y2="20" />
  </svg>
)
const SearchIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const TargetIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
)
const InfoIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)
const CameraIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
  </svg>
)
const GlobeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)
const SaveIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
)

const CHART_COLORS = { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4', success: '#22c55e', warning: '#f59e0b', danger: '#ef4444' }
const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b']

export default function RealtimePage() {
  const [connected, setConnected] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [stats, setStats] = useState({ fps: 0, detections: 0, frameId: 0 })
  const [confidence, setConfidence] = useState(0.45)
  const [ipAddress, setIpAddress] = useState('')
  const [sourceType, setSourceType] = useState('webcam')

  // Object counting state
  const [classCounts, setClassCounts] = useState({})
  const [totalClassCounts, setTotalClassCounts] = useState({})

  // Analytics state
  const [detectionHistory, setDetectionHistory] = useState([])
  const [fpsHistory, setFpsHistory] = useState([])
  const [peakDetections, setPeakDetections] = useState(0)
  const [avgFps, setAvgFps] = useState(0)
  const [totalFrames, setTotalFrames] = useState(0)
  const [minFps, setMinFps] = useState(Infinity)
  const [maxFps, setMaxFps] = useState(0)
  const [totalDetections, setTotalDetections] = useState(0)
  const [framesWithDetections, setFramesWithDetections] = useState(0)

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])

  // CSV log
  const csvLogRef = useRef([])

  const wsRef = useRef(null)
  const canvasRef = useRef(null)
  const frameTimeRef = useRef([])

  const buildCamUrl = (ip) => {
    if (!ip.trim()) return ''
    const trimmed = ip.trim()
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('rtsp://')) return trimmed
    return `http://${trimmed}/video`
  }

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { toast.error('Please log in first.'); return }

    let camUrlParam = ''
    if (sourceType === 'ip') {
      const camUrl = buildCamUrl(ipAddress)
      if (!camUrl) { toast.error('Please enter an IP address or camera URL.'); return }
      camUrlParam = `&cam_url=${encodeURIComponent(camUrl)}`
    } else {
      camUrlParam = `&cam_url=0`
    }

    const wsUrl = `ws://localhost:8002/api/v1/realtime/detect?token=${token}&confidence=${confidence}${camUrlParam}`
    const ws = new WebSocket(wsUrl)
    ws.binaryType = 'blob'
    wsRef.current = ws

    // Reset analytics
    setDetectionHistory([])
    setFpsHistory([])
    setPeakDetections(0)
    setAvgFps(0)
    setTotalFrames(0)
    setMinFps(Infinity)
    setMaxFps(0)
    setTotalDetections(0)
    setFramesWithDetections(0)
    setClassCounts({})
    setTotalClassCounts({})
    frameTimeRef.current = []
    csvLogRef.current = []

    ws.onopen = () => {
      setConnected(true)
      toast.success('Connected to real-time stream!')
    }

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'connected') {
            setStreaming(true)
          } else if (msg.type === 'frame') {
            const fps = calculateFPS()
            setStats({ frameId: msg.frame_id, detections: msg.detections, fps })

            // Update per-class counts
            const frameCounts = msg.class_counts || {}
            setClassCounts(frameCounts)
            setTotalClassCounts((prev) => {
              const updated = { ...prev }
              Object.entries(frameCounts).forEach(([cls, count]) => {
                updated[cls] = (updated[cls] || 0) + count
              })
              return updated
            })

            // CSV log entry
            csvLogRef.current.push({
              frame_id: msg.frame_id,
              timestamp: new Date().toISOString(),
              detections: msg.detections,
              fps: parseFloat(fps.toFixed(2)),
              ...frameCounts,
            })

            setDetectionHistory((prev) => {
              const next = [...prev, { frame: msg.frame_id, detections: msg.detections }]
              return next.length > 60 ? next.slice(-60) : next
            })
            setFpsHistory((prev) => {
              const next = [...prev, { frame: msg.frame_id, fps: parseFloat(fps.toFixed(1)) }]
              return next.length > 60 ? next.slice(-60) : next
            })
            setPeakDetections((prev) => Math.max(prev, msg.detections))
            setTotalFrames(msg.frame_id)
            setTotalDetections((prev) => prev + msg.detections)
            if (msg.detections > 0) setFramesWithDetections((prev) => prev + 1)
            setAvgFps((prev) => {
              if (msg.frame_id <= 1) return fps
              return prev + (fps - prev) / Math.min(msg.frame_id, 30)
            })
            setMinFps((prev) => fps > 0 ? Math.min(prev, fps) : prev)
            setMaxFps((prev) => Math.max(prev, fps))
          } else if (msg.type === 'error' || msg.type === 'warning') {
            toast.error(msg.message)
          }
        } catch { /* ignore parse errors */ }
      } else {
        const blob = event.data
        const url = URL.createObjectURL(blob)
        const img = new window.Image()
        img.onerror = () => { URL.revokeObjectURL(url) }
        img.onload = () => {
          const canvas = canvasRef.current
          if (canvas) {
            if (canvas.width !== img.width || canvas.height !== img.height) {
              canvas.width = img.width
              canvas.height = img.height
            }
            canvas.getContext('2d').drawImage(img, 0, 0)
          }
          URL.revokeObjectURL(url)
        }
        img.src = url
      }
    }

    ws.onerror = () => { toast.error('Connection error. Check if backend is running.') }
    ws.onclose = () => { setConnected(false); setStreaming(false) }
  }, [confidence, ipAddress, sourceType])

  const disconnect = useCallback(() => {
    if (isRecording) stopRecording()
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
  }, [isRecording])

  const calculateFPS = () => {
    const now = performance.now()
    frameTimeRef.current.push(now)
    if (frameTimeRef.current.length > 30) frameTimeRef.current.shift()
    if (frameTimeRef.current.length < 2) return 0
    const elapsed = (now - frameTimeRef.current[0]) / 1000
    return (frameTimeRef.current.length - 1) / elapsed
  }

  // Recording functions
  const startRecording = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const stream = canvas.captureStream(15)
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' })
    recordedChunksRef.current = []
    recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `detection_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Video saved!')
    }
    recorder.start(100)
    mediaRecorderRef.current = recorder
    setIsRecording(true)
    toast.success('Recording started')
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  // CSV export
  const exportCSV = () => {
    if (csvLogRef.current.length === 0) { toast.error('No data to export yet.'); return }
    const allKeys = new Set()
    csvLogRef.current.forEach((row) => Object.keys(row).forEach((k) => allKeys.add(k)))
    const headers = ['frame_id', 'timestamp', 'detections', 'fps', ...Array.from(allKeys).filter((k) => !['frame_id', 'timestamp', 'detections', 'fps'].includes(k)).sort()]
    const csvContent = [
      headers.join(','),
      ...csvLogRef.current.map((row) => headers.map((h) => row[h] ?? 0).join(','))
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `detection_log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported!')
  }

  useEffect(() => { return () => { disconnect() } }, [disconnect])

  // Derived metrics
  const detectionRate = totalFrames > 0 ? ((framesWithDetections / totalFrames) * 100).toFixed(1) : '0.0'
  const avgDetPerFrame = totalFrames > 0 ? (totalDetections / totalFrames).toFixed(2) : '0.00'

  // Pie chart data from total class counts
  const pieData = Object.entries(totalClassCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  // Moving average for detections (window of 5)
  const movingAvgData = detectionHistory.map((d, i, arr) => {
    const window = arr.slice(Math.max(0, i - 4), i + 1)
    const avg = window.reduce((s, v) => s + v.detections, 0) / window.length
    return { frame: d.frame, detections: d.detections, movingAvg: parseFloat(avg.toFixed(1)) }
  })

  // Radar data
  const radarData = [
    { metric: 'FPS', value: Math.min(avgFps / 30 * 100, 100), fullMark: 100 },
    { metric: 'Stability', value: fpsHistory.length > 2 ? Math.max(0, 100 - (maxFps - (minFps === Infinity ? 0 : minFps)) / (avgFps || 1) * 50) : 0, fullMark: 100 },
    { metric: 'Det. Rate', value: parseFloat(detectionRate), fullMark: 100 },
    { metric: 'Peak Load', value: Math.min(peakDetections / 20 * 100, 100), fullMark: 100 },
    { metric: 'Throughput', value: Math.min(totalFrames / 200 * 100, 100), fullMark: 100 },
  ]

  // Cumulative detections
  let cumSum = 0
  const cumulativeData = detectionHistory.map((d) => {
    cumSum += d.detections
    return { frame: d.frame, cumulative: cumSum }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <img src={logoImg} alt="PlantGuard" className="h-12 w-auto object-contain hidden sm:block" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Real-Time Object Detection</h1>
            <p className="text-gray-500 mt-1 text-sm">Live detection using YOLOv8 — use your device webcam or connect an IP camera.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Camera Source</label>
              <div className="flex gap-2">
                <button onClick={() => setSourceType('webcam')} disabled={connected}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${sourceType === 'webcam' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'} disabled:opacity-60`}>
                  <MonitorIcon /> Device Webcam
                </button>
                <button onClick={() => setSourceType('ip')} disabled={connected}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${sourceType === 'ip' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'} disabled:opacity-60`}>
                  <WifiIcon /> IP Camera
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {sourceType === 'ip' ? 'Camera IP Address / URL' : 'Camera Source'}
              </label>
              {sourceType === 'ip' ? (
                <>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2"><WifiIcon /></span>
                    <input type="text" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} disabled={connected}
                      placeholder="e.g. 192.168.1.100:8080"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">IP:port (auto-appends /video) or full URL</p>
                </>
              ) : (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
                  <MonitorIcon /><span>Using built-in device camera (index 0)</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confidence: <span className="text-primary-600 font-semibold">{confidence.toFixed(2)}</span>
              </label>
              <input type="range" min="0.1" max="0.95" step="0.05" value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))} disabled={connected}
                className="w-full accent-primary-600 mt-1" />
              <p className="text-xs text-gray-400 mt-1">Filter detections below this threshold</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={connected ? disconnect : connect}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${connected ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}>
              {connected ? <><StopIcon /> Stop Stream</> : <><PlayIcon /> Start Stream</>}
            </button>
            {streaming && (
              <button onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${isRecording ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'}`}>
                <RecordIcon /> {isRecording ? 'Stop Recording' : 'Record Video'}
              </button>
            )}
            {csvLogRef.current.length > 0 && (
              <button onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors">
                <DownloadIcon /> Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards */}
        {streaming && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {[
              { label: 'Current FPS', value: stats.fps.toFixed(1), icon: '\u26A1', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
              { label: 'Avg FPS', value: avgFps.toFixed(1), icon: '\uD83D\uDCC8', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
              { label: 'Live Detections', value: stats.detections, icon: '\uD83D\uDCE1', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
              { label: 'Peak Detections', value: peakDetections, icon: '\uD83D\uDD1D', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
              { label: 'Total Detections', value: totalDetections, icon: '\uD83C\uDFAF', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
              { label: 'Frames Processed', value: `#${stats.frameId}`, icon: '\uD83C\uDFAC', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
            ].map((m) => (
              <div key={m.label} className={`${m.bg} ${m.border} border rounded-xl p-4 flex flex-col items-center text-center`}>
                <span className="text-2xl mb-1">{m.icon}</span>
                <span className={`text-xl font-bold ${m.text}`}>{m.value}</span>
                <span className="text-xs text-gray-500 mt-0.5">{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Video + Stats + Object Count */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Video feed */}
          <div className="lg:col-span-8">
            <div className="bg-gray-900 rounded-2xl overflow-hidden aspect-video shadow-sm relative">
              <canvas ref={canvasRef} className={`block w-full h-full ${streaming ? '' : 'hidden'}`} />
              {!streaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400 p-8">
                    <VideoIcon className="w-16 h-16 mx-auto mb-3 text-gray-500" />
                    <p className="text-lg font-medium">
                      {connected ? 'Connecting to camera...' : 'Click "Start Stream" to begin'}
                    </p>
                    <p className="text-sm mt-2 text-gray-500">
                      {sourceType === 'webcam' ? "Will use your device's built-in camera" : 'Make sure the IP camera is accessible on your network'}
                    </p>
                  </div>
                </div>
              )}
              {streaming && (
                <>
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full z-10">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-white font-semibold">LIVE</span>
                  </div>
                  {isRecording && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600/80 px-3 py-1 rounded-full z-10">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-xs text-white font-semibold">REC</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right sidebar: Live Metrics + Object Counts */}
          <div className="lg:col-span-4 space-y-4">
            {/* Detailed Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><ChartIcon className="w-4 h-4 text-indigo-500" /> Performance Stats</h3>
              {streaming ? (
                <div className="space-y-2">
                  {[
                    { label: 'Min / Max FPS', value: `${minFps === Infinity ? '-' : minFps.toFixed(1)} / ${maxFps.toFixed(1)}` },
                    { label: 'Avg Det./Frame', value: avgDetPerFrame },
                    { label: 'Detection Rate', value: `${detectionRate}%` },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                      <span className="text-xs text-gray-500">{s.label}</span>
                      <span className="text-sm font-bold text-gray-700">{s.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Waiting for stream...</p>
              )}
            </div>

            {/* Object Counting Card */}
            <div className="bg-white rounded-2xl shadow-sm border p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><SearchIcon className="w-4 h-4 text-indigo-500" /> Detected Objects (Live)</h3>
              {Object.keys(classCounts).length > 0 ? (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {Object.entries(classCounts).sort((a, b) => b[1] - a[1]).map(([cls, count]) => (
                    <div key={cls} className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-indigo-700 capitalize">{cls}</span>
                      <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">{streaming ? 'No objects detected yet...' : 'Start stream to see detections'}</p>
              )}
            </div>

            {/* Cumulative Object Counts Card */}
            <div className="bg-white rounded-2xl shadow-sm border p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><TargetIcon className="w-4 h-4 text-indigo-500" /> Total Object Count</h3>
              {Object.keys(totalClassCounts).length > 0 ? (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {Object.entries(totalClassCounts).sort((a, b) => b[1] - a[1]).map(([cls, count]) => (
                    <div key={cls} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">{cls}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-primary-500 transition-all" style={{ width: `${Math.min((count / Math.max(...Object.values(totalClassCounts))) * 100, 100)}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 w-10 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
              )}
            </div>

            {!streaming && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-700">
                <p className="font-semibold mb-1.5 flex items-center gap-1"><InfoIcon className="w-4 h-4 text-blue-500" /> Quick Setup</p>
                <ul className="space-y-0.5 text-blue-600">
                  <li className="flex items-center gap-1.5"><CameraIcon className="w-3.5 h-3.5 shrink-0" /> Webcam: Select "Device Webcam" and start</li>
                  <li className="flex items-center gap-1.5"><GlobeIcon className="w-3.5 h-3.5 shrink-0" /> IP Cam: Enter address like 192.168.1.5:8080</li>
                  <li className="flex items-center gap-1.5"><TargetIcon className="w-3.5 h-3.5 shrink-0" /> Adjust confidence to filter weak detections</li>
                  <li className="flex items-center gap-1.5"><SaveIcon className="w-3.5 h-3.5 shrink-0" /> Use Record & Export after streaming</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        {detectionHistory.length > 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">\uD83D\uDCC9 Detection Analytics</h2>
              <button onClick={exportCSV}
                className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
                <DownloadIcon /> Export Data
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Object Distribution Pie Chart */}
              {pieData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">\uD83E\uDD67 Object Distribution</h3>
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(val, name) => [val, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Detections Over Time */}
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">\uD83D\uDCC8 Detections Over Time</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={detectionHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="frame" tick={{ fontSize: 10 }} label={{ value: 'Frame #', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip formatter={(val) => [val, 'Objects Detected']} labelFormatter={(l) => `Frame #${l}`} />
                    <defs>
                      <linearGradient id="detGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="detections" stroke={CHART_COLORS.primary} fill="url(#detGrad)" strokeWidth={2} name="Detections" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* FPS Performance */}
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">\u26A1 FPS Performance</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={fpsHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="frame" tick={{ fontSize: 10 }} label={{ value: 'Frame #', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10 }} label={{ value: 'Frames/sec', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip formatter={(val) => [`${val} fps`, 'Frame Rate']} labelFormatter={(l) => `Frame #${l}`} />
                    <Line type="monotone" dataKey="fps" stroke={CHART_COLORS.success} strokeWidth={2} dot={false} name="FPS" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Detections + Moving Avg */}
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">\uD83D\uDCC9 Detections + Moving Average</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <ComposedChart data={movingAvgData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="frame" tick={{ fontSize: 10 }} label={{ value: 'Frame #', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip labelFormatter={(l) => `Frame #${l}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="detections" fill={CHART_COLORS.primary} fillOpacity={0.4} name="Raw Count" radius={[2, 2, 0, 0]} />
                    <Line type="monotone" dataKey="movingAvg" stroke={CHART_COLORS.danger} strokeWidth={2} dot={false} name="5-Frame Avg" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Cumulative Detections */}
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">\uD83D\uDCCA Cumulative Detections</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={cumulativeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="frame" tick={{ fontSize: 10 }} label={{ value: 'Frame #', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10 }} label={{ value: 'Total Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip formatter={(val) => [val, 'Total Objects']} labelFormatter={(l) => `Frame #${l}`} />
                    <defs>
                      <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="cumulative" stroke={CHART_COLORS.accent} fill="url(#cumGrad)" strokeWidth={2} name="Cumulative" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Radar */}
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">\uD83C\uDFAF Performance Overview</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score (%)" dataKey="value" stroke={CHART_COLORS.secondary} fill={CHART_COLORS.secondary} fillOpacity={0.3} strokeWidth={2} />
                    <Tooltip formatter={(val) => [`${parseFloat(val).toFixed(1)}%`, 'Score']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* FPS vs Detection Count (full-width) */}
              <div className="bg-white rounded-2xl shadow-sm border p-5 lg:col-span-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">\uD83D\uDD04 FPS vs Detection Count (Dual Axis)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={detectionHistory.map((d, i) => ({ ...d, fps: fpsHistory[i]?.fps ?? 0 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="frame" tick={{ fontSize: 10 }} label={{ value: 'Frame #', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} label={{ value: 'Detection Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} label={{ value: 'Frames/sec', angle: 90, position: 'insideRight', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip labelFormatter={(l) => `Frame #${l}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="detections" fill={CHART_COLORS.primary} fillOpacity={0.6} name="Objects Detected" radius={[3, 3, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="fps" stroke={CHART_COLORS.warning} strokeWidth={2} dot={false} name="FPS" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
