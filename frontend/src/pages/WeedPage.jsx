import { useState, useRef, useCallback, useEffect } from 'react'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import logoImg from '../logo/WhatsApp_Image_2026-04-06_at_14.42.44-removebg-preview-removebg-preview.png'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  LeafIcon, SproutIcon, ChartIcon, SearchIcon, TargetIcon, ShieldIcon,
  PieIcon, TrendUpIcon, TrendDownIcon, FilmIcon, RadarIcon, ArrowUpIcon,
  SquareIcon, RepeatIcon,
} from '../components/Icons'

const CHART_COLORS = { crop: '#22c55e', weed: '#ef4444', neutral: '#6366f1', area: '#f59e0b', accent: '#06b6d4' }
const PIE_COLORS = ['#22c55e', '#ef4444']

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

export default function WeedPage() {
  const [ipAddress, setIpAddress] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [confidence, setConfidence] = useState(0.3)
  const [streamStats, setStreamStats] = useState(null)
  const [streamPredictions, setStreamPredictions] = useState([])

  // Analytics history
  const [detectionHistory, setDetectionHistory] = useState([])
  const [confidenceDistribution, setConfidenceDistribution] = useState([])
  const [avgConfidenceHistory, setAvgConfidenceHistory] = useState([])
  const [peakWeeds, setPeakWeeds] = useState(0)
  const [peakCrops, setPeakCrops] = useState(0)
  const [totalFrames, setTotalFrames] = useState(0)
  const [totalWeeds, setTotalWeeds] = useState(0)
  const [totalCrops, setTotalCrops] = useState(0)

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const csvLogRef = useRef([])

  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const wsRef = useRef(null)

  const buildCamUrl = (ip) => {
    if (!ip.trim()) return ''
    const trimmed = ip.trim()
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('rtsp://')) return trimmed
    return `http://${trimmed}/video`
  }

  const startStream = useCallback(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { toast.error('Please log in first.'); return }
    const camUrl = buildCamUrl(ipAddress)
    if (!camUrl) { toast.error('Please enter an IP address or camera URL.'); return }

    const encodedCamUrl = encodeURIComponent(camUrl)
    const wsUrl = `ws://localhost:8002/api/v1/weed/stream?token=${token}&confidence=${confidence}&cam_url=${encodedCamUrl}`
    const ws = new WebSocket(wsUrl)
    ws.binaryType = 'blob'
    wsRef.current = ws

    setDetectionHistory([])
    setConfidenceDistribution([])
    setAvgConfidenceHistory([])
    setPeakWeeds(0)
    setPeakCrops(0)
    setTotalFrames(0)
    setTotalWeeds(0)
    setTotalCrops(0)
    csvLogRef.current = []

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
          if (data.error) { toast.error(data.error); stopStream(); return }

          setStreamStats({ frame_id: data.frame_id, detections: data.detections, summary: data.summary })
          setStreamPredictions(data.predictions || [])
          setTotalFrames(data.frame_id)

          const weeds = data.summary?.weeds ?? 0
          const crops = data.summary?.crops ?? 0
          setPeakWeeds((p) => Math.max(p, weeds))
          setPeakCrops((p) => Math.max(p, crops))
          setTotalWeeds((p) => p + weeds)
          setTotalCrops((p) => p + crops)

          // CSV log
          csvLogRef.current.push({
            frame_id: data.frame_id,
            timestamp: new Date().toISOString(),
            total_detections: data.detections,
            weeds,
            crops,
            weed_percentage: data.summary?.weed_percentage ?? 0,
          })

          setDetectionHistory((prev) => {
            const next = [...prev, {
              frame: data.frame_id,
              weeds, crops,
              total: data.summary?.total ?? 0,
              weedPct: data.summary?.weed_percentage ?? 0,
            }]
            return next.length > 50 ? next.slice(-50) : next
          })

          if (data.predictions?.length) {
            const avgConf = data.predictions.reduce((s, p) => s + p.confidence, 0) / data.predictions.length
            setAvgConfidenceHistory((prev) => {
              const next = [...prev, { frame: data.frame_id, avgConf: parseFloat(avgConf.toFixed(1)) }]
              return next.length > 50 ? next.slice(-50) : next
            })

            const buckets = [
              { range: '30-40%', min: 30, max: 40 }, { range: '40-50%', min: 40, max: 50 },
              { range: '50-60%', min: 50, max: 60 }, { range: '60-70%', min: 60, max: 70 },
              { range: '70-80%', min: 70, max: 80 }, { range: '80-90%', min: 80, max: 90 },
              { range: '90-100%', min: 90, max: 101 },
            ]
            setConfidenceDistribution(buckets.map((b) => ({
              range: b.range,
              weeds: data.predictions.filter((p) => p.label === 'Weed' && p.confidence >= b.min && p.confidence < b.max).length,
              crops: data.predictions.filter((p) => p.label === 'Crop' && p.confidence >= b.min && p.confidence < b.max).length,
            })))
          }
        } catch { /* ignore */ }
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

    ws.onclose = () => setIsStreaming(false)
    ws.onerror = () => { toast.error('WebSocket connection error'); setIsStreaming(false) }
  }, [confidence, ipAddress])

  const stopStream = useCallback(() => {
    if (isRecording) stopRecording()
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    setIsStreaming(false)
  }, [isRecording])

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
      a.download = `weed_detection_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
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
    const headers = ['frame_id', 'timestamp', 'total_detections', 'weeds', 'crops', 'weed_percentage']
    const csvContent = [
      headers.join(','),
      ...csvLogRef.current.map((row) => headers.map((h) => row[h] ?? 0).join(','))
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weed_log_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported!')
  }

  useEffect(() => { return () => stopStream() }, [stopStream])

  // Radar data
  const radarData = [
    { metric: 'Weed Density', value: detectionHistory.length ? detectionHistory[detectionHistory.length - 1].weedPct : 0, fullMark: 100 },
    { metric: 'Detection Vol.', value: Math.min((streamStats?.detections ?? 0) / 20 * 100, 100), fullMark: 100 },
    { metric: 'Peak Weeds', value: Math.min(peakWeeds / 15 * 100, 100), fullMark: 100 },
    { metric: 'Peak Crops', value: Math.min(peakCrops / 15 * 100, 100), fullMark: 100 },
    { metric: 'Frames', value: Math.min(totalFrames / 100 * 100, 100), fullMark: 100 },
  ]

  // Pie data
  const pieData = totalWeeds + totalCrops > 0 ? [
    { name: 'Crops', value: totalCrops },
    { name: 'Weeds', value: totalWeeds },
  ] : []

  // Cumulative data
  let cumWeeds = 0, cumCrops = 0
  const cumulativeData = detectionHistory.map((d) => {
    cumWeeds += d.weeds
    cumCrops += d.crops
    return { frame: d.frame, weeds: cumWeeds, crops: cumCrops }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <img src={logoImg} alt="PlantGuard" className="h-12 w-auto object-contain hidden sm:block" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><LeafIcon className="w-6 h-6 text-green-600" /> Real-Time Weed Detection</h1>
            <p className="text-gray-500 mt-1 text-sm">Connect your IP camera to detect weeds in crop fields in real-time using AI.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Camera IP Address / URL</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2"><WifiIcon /></span>
                <input
                  type="text" value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  disabled={isStreaming}
                  placeholder="e.g. 192.168.1.100:8080 or http://..."
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Enter IP:port (auto-appends /video) or a full camera URL</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confidence Threshold: <span className="text-green-600 font-bold">{(confidence * 100).toFixed(0)}%</span>
              </label>
              <input type="range" min="0.1" max="0.95" step="0.05" value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))} disabled={isStreaming}
                className="w-full accent-green-600 mt-2" />
              <p className="text-xs text-gray-400 mt-1">Only detections above this threshold are shown (applied server-side)</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={isStreaming ? stopStream : startStream}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${
                isStreaming ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}>
              {isStreaming ? <><StopIcon /> Stop Stream</> : <><PlayIcon /> Start Stream</>}
            </button>
            {isStreaming && (
              <button onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${isRecording ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'}`}>
                <RecordIcon /> {isRecording ? 'Stop Rec' : 'Record'}
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
        {isStreaming && streamStats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {[
              { label: 'Frame', value: `#${streamStats.frame_id}`, Icon: FilmIcon, iconColor: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
              { label: 'Total Detections', value: streamStats.detections, Icon: RadarIcon, iconColor: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
              { label: 'Crops (Live)', value: streamStats.summary?.crops ?? 0, Icon: SproutIcon, iconColor: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
              { label: 'Weeds (Live)', value: streamStats.summary?.weeds ?? 0, Icon: LeafIcon, iconColor: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
              { label: 'Peak Weeds', value: peakWeeds, Icon: ArrowUpIcon, iconColor: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
              { label: 'Weed Coverage', value: `${streamStats.summary?.weed_percentage ?? 0}%`, Icon: SquareIcon, iconColor: (streamStats.summary?.weed_percentage ?? 0) > 50 ? 'text-red-500' : 'text-yellow-500', bg: (streamStats.summary?.weed_percentage ?? 0) > 50 ? 'bg-red-50' : 'bg-yellow-50', border: (streamStats.summary?.weed_percentage ?? 0) > 50 ? 'border-red-200' : 'border-yellow-200', text: (streamStats.summary?.weed_percentage ?? 0) > 50 ? 'text-red-700' : 'text-yellow-700' },
            ].map((m) => (
              <div key={m.label} className={`${m.bg} ${m.border} border rounded-xl p-4 flex flex-col items-center text-center`}>
                <m.Icon className={`w-6 h-6 mb-1 ${m.iconColor}`} />
                <span className={`text-xl font-bold ${m.text}`}>{m.value}</span>
                <span className="text-xs text-gray-500 mt-0.5">{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Video + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-8">
            <div ref={containerRef} className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video shadow-sm">
              <canvas ref={canvasRef} className={`block w-full h-full ${isStreaming ? '' : 'hidden'}`} />
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <VideoIcon className="w-16 h-16 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Camera stream not started</p>
                    <p className="text-gray-500 text-xs mt-1">Enter your IP camera address and click "Start Stream"</p>
                  </div>
                </div>
              )}
              {isStreaming && (
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

          {/* Stats Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><ChartIcon className="w-4 h-4 text-indigo-500" /> Session Summary</h3>
              {streamStats ? (
                <div className="space-y-2">
                  {[
                    { label: 'Total Weeds Detected', value: totalWeeds, color: 'text-red-600' },
                    { label: 'Total Crops Detected', value: totalCrops, color: 'text-green-600' },
                    { label: 'Peak Crops', value: peakCrops, color: 'text-emerald-600' },
                    { label: 'Avg Weed %', value: detectionHistory.length > 0 ? `${(detectionHistory.reduce((s, d) => s + d.weedPct, 0) / detectionHistory.length).toFixed(1)}%` : '0%', color: 'text-amber-600' },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                      <span className="text-xs text-gray-500">{s.label}</span>
                      <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                  {/* Weed Coverage Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Weed Coverage</span>
                      <span className={`text-lg font-bold ${(streamStats.summary?.weed_percentage ?? 0) > 50 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {streamStats.summary?.weed_percentage ?? 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(streamStats.summary?.weed_percentage ?? 0, 100)}%`,
                          backgroundColor: (streamStats.summary?.weed_percentage ?? 0) > 50 ? CHART_COLORS.weed : CHART_COLORS.area }} />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Waiting for stream data...</p>
              )}
            </div>

            {/* Live Detections */}
            {streamPredictions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><SearchIcon className="w-4 h-4 text-indigo-500" /> Live Detections</h3>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {streamPredictions.map((pred, i) => {
                    const isWeed = pred.label === 'Weed'
                    return (
                      <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${isWeed ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex items-center gap-1.5">
                          {isWeed ? <LeafIcon className="w-4 h-4 text-red-500" /> : <SproutIcon className="w-4 h-4 text-green-600" />}
                          <span className={`font-semibold text-xs ${isWeed ? 'text-red-600' : 'text-green-600'}`}>{pred.label}</span>
                        </div>
                        <span className="text-gray-400 text-xs">{pred.confidence}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        {detectionHistory.length > 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><TrendDownIcon className="w-5 h-5 text-indigo-500" /> Detection Analytics</h2>
              <button onClick={exportCSV}
                className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
                <DownloadIcon /> Export Data
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Crop vs Weed Pie */}
              {pieData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5"><PieIcon className="w-4 h-4 text-indigo-500" /> Crop vs Weed Distribution</h3>
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

              {/* Weed vs Crop Over Time */}
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5"><TrendUpIcon className="w-4 h-4 text-green-500" /> Weed vs Crop Over Time</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={detectionHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="frame" tick={{ fontSize: 10 }} label={{ value: 'Frame #', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip labelFormatter={(l) => `Frame #${l}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="crops" stroke={CHART_COLORS.crop} strokeWidth={2} dot={false} name="Crops" />
                    <Line type="monotone" dataKey="weeds" stroke={CHART_COLORS.weed} strokeWidth={2} dot={false} name="Weeds" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Weed Coverage Trend */}
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5"><TrendDownIcon className="w-4 h-4 text-red-500" /> Weed Coverage Trend</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={detectionHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="frame" tick={{ fontSize: 10 }} label={{ value: 'Frame #', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} label={{ value: 'Weed %', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip formatter={(val) => [`${val}%`, 'Weed Coverage']} labelFormatter={(l) => `Frame #${l}`} />
                    <defs>
                      <linearGradient id="weedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.weed} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.weed} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="weedPct" stroke={CHART_COLORS.weed} fill="url(#weedGrad)" strokeWidth={2} name="Weed %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Cumulative Trend */}
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5"><ChartIcon className="w-4 h-4 text-indigo-500" /> Cumulative Detections</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={cumulativeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="frame" tick={{ fontSize: 10 }} label={{ value: 'Frame #', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} label={{ value: 'Total', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip labelFormatter={(l) => `Frame #${l}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="crops" stroke={CHART_COLORS.crop} fill={CHART_COLORS.crop} fillOpacity={0.15} strokeWidth={2} name="Crops" />
                    <Area type="monotone" dataKey="weeds" stroke={CHART_COLORS.weed} fill={CHART_COLORS.weed} fillOpacity={0.15} strokeWidth={2} name="Weeds" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Confidence Distribution */}
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5"><TargetIcon className="w-4 h-4 text-indigo-500" /> Confidence Distribution</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={confidenceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 9 }} label={{ value: 'Confidence Range', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip labelFormatter={(l) => `Range: ${l}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="crops" stackId="a" fill={CHART_COLORS.crop} name="Crops" />
                    <Bar dataKey="weeds" stackId="a" fill={CHART_COLORS.weed} name="Weeds" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Radar */}
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5"><ShieldIcon className="w-4 h-4 text-blue-500" /> Detection Overview</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score (%)" dataKey="value" stroke={CHART_COLORS.neutral} fill={CHART_COLORS.neutral} fillOpacity={0.3} strokeWidth={2} />
                    <Tooltip formatter={(val) => [`${parseFloat(val).toFixed(1)}%`, 'Score']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Combined: Stacked bar + weed % line (full width) */}
              <div className="bg-white rounded-2xl shadow-sm border p-5 lg:col-span-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5"><RepeatIcon className="w-4 h-4 text-indigo-500" /> Detections per Frame with Weed Coverage (Dual Axis)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={detectionHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="frame" tick={{ fontSize: 10 }} label={{ value: 'Frame #', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} label={{ value: 'Detection Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[0, 100]} label={{ value: 'Weed %', angle: 90, position: 'insideRight', offset: 10, fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip labelFormatter={(l) => `Frame #${l}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="crops" stackId="a" fill={CHART_COLORS.crop} name="Crops" />
                    <Bar yAxisId="left" dataKey="weeds" stackId="a" fill={CHART_COLORS.weed} name="Weeds" radius={[3, 3, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="weedPct" stroke={CHART_COLORS.area} strokeWidth={2} dot={false} name="Weed %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-6 mt-6 text-sm text-gray-500 justify-center">
          <div className="flex items-center gap-2"><SproutIcon className="w-4 h-4 text-green-600" /> <span>Crop (desired)</span></div>
          <div className="flex items-center gap-2"><LeafIcon className="w-4 h-4 text-red-500" /> <span>Weed (unwanted)</span></div>
        </div>
      </div>
    </div>
  )
}
