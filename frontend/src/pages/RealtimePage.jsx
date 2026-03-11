import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

export default function RealtimePage() {
  const [connected, setConnected] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [stats, setStats] = useState({ fps: 0, detections: 0, frameId: 0 })
  const [confidence, setConfidence] = useState(0.45)
  
  const wsRef = useRef(null)
  const canvasRef = useRef(null)
  const frameTimeRef = useRef([])

  // ── Connect to WebSocket ────────────────────────────
  const connect = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      toast.error('Please log in first.')
      return
    }

    const wsUrl = `ws://localhost:8000/api/v1/realtime/detect?token=${token}&confidence=${confidence}`
    
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      toast.success('Connected to real-time stream!')
    }

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        // JSON metadata
        const msg = JSON.parse(event.data)
        
        if (msg.type === 'connected') {
          setStreaming(true)
        } else if (msg.type === 'frame') {
          setStats({
            frameId: msg.frame_id,
            detections: msg.detections,
            fps: calculateFPS()
          })
        } else if (msg.type === 'error' || msg.type === 'warning') {
          toast.error(msg.message)
        }
      } else {
        // Binary frame data (JPEG)
        const blob = event.data
        const img = new Image()
        img.onload = () => {
          const canvas = canvasRef.current
          if (canvas) {
            const ctx = canvas.getContext('2d')
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
          }
        }
        img.src = URL.createObjectURL(blob)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      toast.error('Connection error. Check if backend is running.')
    }

    ws.onclose = () => {
      setConnected(false)
      setStreaming(false)
      toast('Stream disconnected.', { icon: '⚠️' })
    }
  }

  // ── Disconnect ──────────────────────────────────────
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  // ── FPS calculation ─────────────────────────────────
  const calculateFPS = () => {
    const now = performance.now()
    frameTimeRef.current.push(now)
    
    // Keep last 30 frame times
    if (frameTimeRef.current.length > 30) {
      frameTimeRef.current.shift()
    }
    
    if (frameTimeRef.current.length < 2) return 0
    
    const elapsed = (now - frameTimeRef.current[0]) / 1000
    return (frameTimeRef.current.length - 1) / elapsed
  }

  // ── Cleanup on unmount ──────────────────────────────
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Real-Time Object Detection</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Live detection using YOLOv8 and your IP webcam.
          </p>
        </div>

        <div className="card space-y-6">
          
          {/* ── Controls ─────────────────────────────── */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Threshold: <span className="text-primary-600 font-semibold">{confidence.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="0.95"
                step="0.05"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                disabled={connected}
                className="w-full"
              />
            </div>

            <button
              onClick={connected ? disconnect : connect}
              disabled={streaming && !connected}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-colors duration-200 ${
                connected
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {connected ? '⏹ Stop Stream' : '▶ Start Stream'}
            </button>
          </div>

          {/* ── Stats Bar ────────────────────────────── */}
          {streaming && (
            <div className="bg-gray-100 rounded-lg p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">FPS</p>
                <p className="text-2xl font-bold text-gray-800">{stats.fps.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Detections</p>
                <p className="text-2xl font-bold text-primary-600">{stats.detections}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Frames</p>
                <p className="text-2xl font-bold text-gray-800">{stats.frameId}</p>
              </div>
            </div>
          )}

          {/* ── Video Canvas ─────────────────────────── */}
          <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
            {streaming ? (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400 p-8">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-lg font-medium">
                  {connected ? 'Connecting to camera...' : 'Click "Start Stream" to begin'}
                </p>
                <p className="text-sm mt-2 text-gray-500">
                  Make sure IP Webcam app is running on your phone
                </p>
              </div>
            )}
          </div>

          {/* ── Info Box ─────────────────────────────── */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-2">📱 Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Install "IP Webcam" app on your Android phone</li>
              <li>Start the server in the app (usually on port 8080)</li>
              <li>Note your phone's IP address shown in the app</li>
              <li>Update <code className="bg-blue-100 px-1 rounded">IP_CAM_URL</code> in backend <code className="bg-blue-100 px-1 rounded">.env</code> file</li>
              <li>Restart backend and click "Start Stream" above</li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  )
}