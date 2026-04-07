import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

// ── Animated counter hook ──
function useCounter(target, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (!startOnView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const animate = (now) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration, startOnView])

  return { count, ref }
}

// ── Intersection observer hook for reveal animations ──
function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

// ── Realistic Plant Growth Canvas Animation ──
function PlantGrowthCanvas() {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      w = canvas.parentElement.clientWidth
      h = canvas.parentElement.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const startTime = performance.now()
    const growDuration = 5000
    const rand = (a, b) => a + Math.random() * (b - a)

    // ── Recursive tree structure ──
    let segments = []
    let allLeaves = []
    let flowers = []

    function buildPlant() {
      segments = []
      allLeaves = []
      flowers = []

      const cx = w / 2
      const groundY = h * 0.87

      // Recursive branch builder
      function addBranch(x1, y1, angle, length, thickness, depth, startT) {
        const endT = startT + 0.08 + depth * 0.04
        const sway = (Math.random() - 0.5) * 0.15
        const x2 = x1 + Math.sin(angle + sway) * length
        const y2 = y1 - Math.cos(angle + sway) * length
        // Control points for organic curve
        const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * length * 0.3
        const my = (y1 + y2) / 2 + (Math.random() - 0.5) * length * 0.15

        segments.push({ x1, y1, x2, y2, mx, my, thickness, depth, startAt: startT, endAt: endT })

        // Add leaves on branches depth >= 2
        if (depth >= 2) {
          const leafCount = depth >= 3 ? 3 : 2
          for (let i = 0; i < leafCount; i++) {
            const lt = 0.4 + i * 0.25
            const lx = x1 * (1 - lt) * (1 - lt) + 2 * mx * lt * (1 - lt) + x2 * lt * lt
            const ly = y1 * (1 - lt) * (1 - lt) + 2 * my * lt * (1 - lt) + y2 * lt * lt
            const la = angle + (i % 2 === 0 ? 1 : -1) * rand(0.4, 1.2)
            allLeaves.push({
              x: lx, y: ly,
              angle: la,
              size: rand(10, 22) * (depth >= 3 ? 0.7 : 1),
              appearAt: startT + lt * (endT - startT) * 0.7,
              hue: rand(95, 140),
              lightness: rand(30, 48),
            })
          }
        }

        // Add flower at terminal branches
        if (depth >= 4) {
          flowers.push({
            x: x2, y: y2,
            size: rand(6, 12),
            appearAt: endT + 0.02,
            hue: rand(0, 60),
          })
        }

        // Recurse
        if (depth < 5 && length > 12) {
          const childCount = depth < 2 ? 2 : (Math.random() > 0.3 ? 2 : 1)
          for (let c = 0; c < childCount; c++) {
            const spread = depth < 2 ? rand(0.3, 0.55) : rand(0.35, 0.75)
            const childAngle = angle + (c === 0 ? -spread : spread) + rand(-0.1, 0.1)
            const childLen = length * rand(0.6, 0.78)
            const childThick = thickness * rand(0.55, 0.7)
            addBranch(x2, y2, childAngle, childLen, childThick, depth + 1, endT - 0.02)
          }
        }
      }

      // Build main trunk (slightly off-center for organic feel)
      const trunkLen = h * 0.28
      addBranch(cx, groundY, rand(-0.05, 0.05), trunkLen, 9, 0, 0)

      // Second smaller trunk
      addBranch(cx + rand(-8, 8), groundY, rand(-0.12, 0.12), trunkLen * 0.85, 7, 0, 0.02)
    }

    buildPlant()

    // ── Butterflies ──
    const butterflies = Array.from({ length: 4 }, () => ({
      x: rand(w * 0.1, w * 0.9), y: rand(h * 0.15, h * 0.6),
      vx: rand(-0.4, 0.4), vy: rand(-0.3, 0.3),
      size: rand(5, 9), phase: rand(0, Math.PI * 2),
      wingSpeed: rand(6, 10),
      hue: [40, 200, 320, 280][Math.floor(Math.random() * 4)],
    }))

    // ── Particles ──
    const particles = Array.from({ length: 50 }, () => ({
      x: rand(0, w), y: rand(0, h),
      size: rand(0.8, 2.5), speed: rand(0.1, 0.35),
      opacity: rand(0.15, 0.5), phase: rand(0, Math.PI * 2),
    }))

    // ── Seed data for deterministic soil pebbles ──
    const pebbles = Array.from({ length: 20 }, () => ({
      ox: rand(-100, 100), oy: rand(-6, 6), r: rand(1.5, 3.5), c: rand(35, 55),
    }))

    // ── Drawing helpers ──
    function quadPoint(t, p0, p1, p2) {
      const mt = 1 - t
      return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2
    }

    function drawSoil(progress) {
      const soilY = h * 0.87
      const soilFactor = Math.min(progress * 6, 1)
      const soilW = 130 * soilFactor
      const soilH = 22 * soilFactor

      // Soil body
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(w / 2, soilY + 3, soilW, soilH, 0, Math.PI, 0)
      const g = ctx.createRadialGradient(w / 2, soilY - 5, 0, w / 2, soilY, soilW)
      g.addColorStop(0, '#6d4c41')
      g.addColorStop(0.5, '#5d4037')
      g.addColorStop(1, '#3e2723')
      ctx.fillStyle = g
      ctx.fill()

      // Pebbles
      pebbles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(w / 2 + p.ox * soilFactor, soilY + p.oy, p.r * soilFactor, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(20, 15%, ${p.c}%)`
        ctx.globalAlpha = 0.4 * soilFactor
        ctx.fill()
      })
      ctx.restore()
      ctx.globalAlpha = 1

      // Grass tufts around base
      if (soilFactor > 0.5) {
        const grassAlpha = Math.min((soilFactor - 0.5) * 3, 1)
        for (let i = -8; i <= 8; i++) {
          const gx = w / 2 + i * 14
          const gy = soilY + 2
          ctx.save()
          ctx.translate(gx, gy)
          ctx.rotate((i * 0.08))
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.quadraticCurveTo(2 + i * 0.5, -12 * grassAlpha, 1, -18 * grassAlpha)
          ctx.strokeStyle = `hsla(${110 + i * 3}, 55%, ${35 + Math.abs(i) * 2}%, ${grassAlpha * 0.6})`
          ctx.lineWidth = 1.5
          ctx.stroke()
          ctx.restore()
        }
      }
    }

    function drawSegment(seg, progress, time) {
      const localP = Math.max(0, Math.min(1, (progress - seg.startAt) / (seg.endAt - seg.startAt)))
      if (localP <= 0) return

      // Draw the branch as a tapered quadratic curve
      const steps = 24
      const drawn = Math.floor(localP * steps)
      if (drawn < 2) return

      for (let i = 0; i < drawn - 1; i++) {
        const t0 = i / steps
        const t1 = (i + 1) / steps
        const x0 = quadPoint(t0, seg.x1, seg.mx, seg.x2)
        const y0 = quadPoint(t0, seg.y1, seg.my, seg.y2)
        const x1 = quadPoint(t1, seg.x1, seg.mx, seg.x2)
        const y1 = quadPoint(t1, seg.y1, seg.my, seg.y2)
        const thick = seg.thickness * (1 - t1 * 0.6) * (0.5 + localP * 0.5)

        ctx.beginPath()
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)

        // Bark gradient for trunk, green for thin branches
        if (seg.depth < 2) {
          ctx.strokeStyle = `hsl(25, ${30 - seg.depth * 5}%, ${28 + seg.depth * 5}%)`
        } else {
          ctx.strokeStyle = `hsl(${115 + seg.depth * 5}, 45%, ${30 + seg.depth * 4}%)`
        }
        ctx.lineWidth = thick
        ctx.lineCap = 'round'
        ctx.stroke()

        // Bark texture on trunk
        if (seg.depth < 2 && thick > 3 && i % 3 === 0) {
          ctx.beginPath()
          ctx.moveTo(x0 - thick * 0.3, y0)
          ctx.lineTo(x1 + thick * 0.2, y1)
          ctx.strokeStyle = `hsla(25, 20%, 22%, 0.15)`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }

    function drawLeaf(leaf, progress, time) {
      const growth = Math.max(0, Math.min(1, (progress - leaf.appearAt) / 0.1))
      if (growth <= 0) return

      const s = leaf.size * growth
      const wobble = Math.sin(time * 1.8 + leaf.x * 0.02 + leaf.y * 0.01) * 0.08

      ctx.save()
      ctx.translate(leaf.x, leaf.y)
      ctx.rotate(leaf.angle + wobble)
      ctx.globalAlpha = Math.min(growth * 1.5, 0.92)

      // Shadow
      ctx.beginPath()
      ctx.moveTo(1, 1)
      ctx.bezierCurveTo(s * 0.35, -s * 0.22 + 1, s * 0.75, -s * 0.12 + 1, s + 1, 1)
      ctx.bezierCurveTo(s * 0.75, s * 0.12 + 1, s * 0.35, s * 0.22 + 1, 1, 1)
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.fill()

      // Leaf body
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(s * 0.35, -s * 0.22, s * 0.75, -s * 0.12, s, 0)
      ctx.bezierCurveTo(s * 0.75, s * 0.12, s * 0.35, s * 0.22, 0, 0)

      const lg = ctx.createLinearGradient(0, -s * 0.1, s, s * 0.1)
      lg.addColorStop(0, `hsl(${leaf.hue}, 60%, ${leaf.lightness - 5}%)`)
      lg.addColorStop(0.5, `hsl(${leaf.hue}, 55%, ${leaf.lightness + 5}%)`)
      lg.addColorStop(1, `hsl(${leaf.hue + 10}, 50%, ${leaf.lightness + 12}%)`)
      ctx.fillStyle = lg
      ctx.fill()

      // Main vein
      ctx.beginPath()
      ctx.moveTo(s * 0.05, 0)
      ctx.lineTo(s * 0.9, 0)
      ctx.strokeStyle = `hsl(${leaf.hue}, 40%, ${leaf.lightness - 10}%)`
      ctx.lineWidth = 0.7
      ctx.globalAlpha *= 0.5
      ctx.stroke()

      // Side veins
      for (let v = 0.2; v < 0.85; v += 0.15) {
        ctx.beginPath()
        ctx.moveTo(s * v, 0)
        ctx.lineTo(s * (v + 0.1), -s * 0.07)
        ctx.moveTo(s * v, 0)
        ctx.lineTo(s * (v + 0.1), s * 0.07)
        ctx.lineWidth = 0.4
        ctx.stroke()
      }

      ctx.restore()
      ctx.globalAlpha = 1
    }

    function drawFlowerBud(flower, progress, time) {
      const growth = Math.max(0, Math.min(1, (progress - flower.appearAt) / 0.12))
      if (growth <= 0) return
      const s = flower.size * growth
      const wobble = Math.sin(time * 0.8 + flower.x) * 0.05

      ctx.save()
      ctx.translate(flower.x, flower.y)
      ctx.rotate(wobble)
      ctx.globalAlpha = Math.min(growth * 1.5, 0.9)

      // Petals
      for (let i = 0; i < 5; i++) {
        ctx.save()
        ctx.rotate((i / 5) * Math.PI * 2 + time * 0.15)
        ctx.beginPath()
        ctx.ellipse(s * 0.5, 0, s * 0.5, s * 0.22, 0, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${flower.hue}, 80%, ${70 + i * 3}%)`
        ctx.fill()
        ctx.restore()
      }
      // Center
      ctx.beginPath()
      ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2)
      ctx.fillStyle = `hsl(${flower.hue + 30}, 90%, 55%)`
      ctx.fill()

      ctx.restore()
      ctx.globalAlpha = 1
    }

    function drawButterfly(b, time) {
      ctx.save()
      ctx.translate(b.x, b.y)
      const wing = Math.sin(time * b.wingSpeed + b.phase) * 0.9

      ctx.globalAlpha = 0.7
      // Left wing
      ctx.save()
      ctx.scale(Math.cos(wing), 1)
      ctx.beginPath()
      ctx.ellipse(-b.size * 0.4, 0, b.size, b.size * 0.6, -0.3, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${b.hue}, 70%, 60%, 0.8)`
      ctx.fill()
      ctx.restore()
      // Right wing
      ctx.save()
      ctx.scale(Math.cos(wing + 0.3), 1)
      ctx.beginPath()
      ctx.ellipse(b.size * 0.4, 0, b.size, b.size * 0.6, 0.3, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${b.hue}, 70%, 55%, 0.8)`
      ctx.fill()
      ctx.restore()
      // Body
      ctx.beginPath()
      ctx.ellipse(0, 0, 1.2, b.size * 0.35, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#333'
      ctx.fill()

      ctx.restore()
      ctx.globalAlpha = 1
    }

    // ── Sunlight rays ──
    function drawSunRays(time, progress) {
      if (progress < 0.5) return
      const alpha = Math.min((progress - 0.5) * 2, 1) * 0.08
      const rayCount = 5
      ctx.save()
      for (let i = 0; i < rayCount; i++) {
        const a = -0.6 + i * 0.25 + Math.sin(time * 0.2 + i) * 0.05
        const len = h * 1.2
        ctx.beginPath()
        ctx.moveTo(w * 0.85, 0)
        ctx.lineTo(w * 0.85 + Math.cos(a) * len, Math.sin(a) * len)
        ctx.lineTo(w * 0.85 + Math.cos(a + 0.04) * len, Math.sin(a + 0.04) * len)
        ctx.closePath()
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha * (0.7 + Math.sin(time + i) * 0.3)})`
        ctx.fill()
      }
      ctx.restore()
    }

    function draw(now) {
      animRef.current = requestAnimationFrame(draw)
      const elapsed = now - startTime
      const time = elapsed / 1000
      const rawProgress = Math.min(elapsed / growDuration, 1)
      const progress = 1 - Math.pow(1 - rawProgress, 3)

      ctx.clearRect(0, 0, w, h)

      // Soft radial glow
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, h * 0.75)
      bg.addColorStop(0, 'rgba(200, 240, 200, 0.08)')
      bg.addColorStop(1, 'rgba(200, 240, 200, 0)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Sun rays
      drawSunRays(time, progress)

      // Particles
      particles.forEach((p) => {
        p.y -= p.speed
        p.x += Math.sin(time * 0.7 + p.phase) * 0.25
        if (p.y < -10) { p.y = h + 10; p.x = rand(0, w) }
        const pulse = 0.6 + Math.sin(time * 2 + p.phase) * 0.4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 220, 130, ${p.opacity * pulse * Math.min(progress * 3, 1)})`
        ctx.fill()
      })

      // Soil
      drawSoil(progress)

      // Draw all segments (branches)
      segments.forEach((s) => drawSegment(s, progress, time))

      // Draw all leaves
      allLeaves.forEach((l) => drawLeaf(l, progress, time))

      // Draw flowers
      flowers.forEach((f) => drawFlowerBud(f, progress, time))

      // Butterflies (appear after growth)
      if (progress > 0.7) {
        const bAlpha = Math.min((progress - 0.7) / 0.3, 1)
        butterflies.forEach((b) => {
          b.x += b.vx + Math.sin(time * 0.5 + b.phase) * 0.6
          b.y += b.vy + Math.cos(time * 0.7 + b.phase) * 0.4
          if (b.x < 0 || b.x > w) b.vx *= -1
          if (b.y < h * 0.05 || b.y > h * 0.7) b.vy *= -1
          b.x = Math.max(0, Math.min(w, b.x))
          b.y = Math.max(h * 0.05, Math.min(h * 0.7, b.y))
          ctx.globalAlpha = bAlpha
          drawButterfly(b, time)
          ctx.globalAlpha = 1
        })
      }
    }

    const resizeHandler = () => { resize(); buildPlant() }
    window.addEventListener('resize', resizeHandler)
    animRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resizeHandler)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0" />
}

// ── Feature Card ──
function FeatureCard({ icon, title, description, to, color, delay, visible }) {
  return (
    <Link
      to={to}
      className={`group relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-700 transition-colors">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
      <div className="mt-5 flex items-center gap-2 text-primary-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Get Started
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
      <div className={`absolute inset-x-0 bottom-0 h-1 rounded-b-2xl ${color.replace('bg-', 'bg-').replace('/10', '')} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </Link>
  )
}

// ── Step Card ──
function StepCard({ number, title, description, delay, visible }) {
  return (
    <div
      className={`text-center transition-all duration-700 transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary-200">
        {number}
      </div>
      <h4 className="text-lg font-bold text-gray-800 mb-2">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{description}</p>
    </div>
  )
}

// ── Main HomePage ──
export default function HomePage() {
  const { user } = useAuth()

  // Reveal refs
  const featuresReveal = useReveal(0.1)
  const stepsReveal = useReveal(0.1)
  const statsReveal = useReveal(0.2)
  const ctaReveal = useReveal(0.2)

  // Counters
  const counter1 = useCounter(3, 1500)
  const counter2 = useCounter(50, 2000)
  const counter3 = useCounter(98, 2200)
  const counter4 = useCounter(24, 1800)

  // Parallax for hero
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div
              className="space-y-8"
              style={{ transform: `translateY(${scrollY * 0.05}px)` }}
            >
              <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 px-4 py-2 rounded-full text-sm font-medium animate-fade-in-down">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                AI-Powered Agriculture
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight animate-fade-in-up">
                Protect Your Crops{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-green-500">
                  Intelligently
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg animate-fade-in-up-delay">
                Welcome back, <span className="font-semibold text-gray-800">{user?.full_name}</span>!
                Detect plant diseases, identify harmful insects, and monitor weeds in real-time using advanced AI technology.
              </p>

              <div className="flex flex-wrap gap-4 animate-fade-in-up-delay-2">
                <Link
                  to="/disease"
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Start Detection
                </Link>
                <Link
                  to="/realtime"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  Live Monitor
                </Link>
              </div>
            </div>

            {/* Right: Plant Growth Animation */}
            <div
              className="relative h-[420px] sm:h-[500px] lg:h-[540px]"
              style={{ transform: `translateY(${scrollY * -0.03}px)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-transparent rounded-3xl" />
              <PlantGrowthCanvas />
              {/* Decorative rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-green-200/40 animate-spin-very-slow" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-green-100/30 animate-spin-very-slow-reverse" />
            </div>
          </div>
        </div>

        {/* Gradient fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section ref={featuresReveal.ref} className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${featuresReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">What We Offer</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Powerful AI Tools for Your Farm</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
              Everything you need to keep your crops healthy and your farm productive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              to="/disease"
              icon={<svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 .5 20 .5s-1.3 5.7-3.3 11.4A7 7 0 0 1 11 20z" /><path d="M6.7 17.3l5.3-5.3" /></svg>}
              title="Disease Detection"
              description="Upload a leaf photo and instantly identify diseases with AI-powered analysis and treatment suggestions."
              color="bg-green-100"
              delay={0}
              visible={featuresReveal.visible}
            />
            <FeatureCard
              to="/realtime"
              icon={<svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" /></svg>}
              title="Real-Time Monitor"
              description="Connect your camera and get live AI analysis of your crops with instant disease and pest alerts."
              color="bg-blue-100"
              delay={150}
              visible={featuresReveal.visible}
            />
            <FeatureCard
              to="/insect"
              icon={<svg className="w-7 h-7 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="m16 14 2.5 2.5" /><path d="m8 14-2.5 2.5" /><path d="M9 18h6" /><path d="M12 10v8" /><circle cx="12" cy="14" r="4" /></svg>}
              title="Insect Detection"
              description="Identify harmful insects and pests on your farm with detailed treatment and prevention guidance."
              color="bg-orange-100"
              delay={300}
              visible={featuresReveal.visible}
            />
            <FeatureCard
              to="/weed"
              icon={<svg className="w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 19V5" /><path d="M10 19V6.8" /><path d="M14 19V4" /><path d="M18 19V7.5" /><path d="M2 19h20" /></svg>}
              title="Weed Detection"
              description="Real-time weed vs crop classification from your camera feed with advanced analytics and reporting."
              color="bg-red-100"
              delay={450}
              visible={featuresReveal.visible}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section ref={stepsReveal.ref} className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ${stepsReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line */}
            <div className={`hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 transition-all duration-1000 ${stepsReveal.visible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />

            <StepCard
              number="1"
              title="Upload or Connect"
              description="Take a photo of your plant or connect your IP camera for live monitoring."
              delay={0}
              visible={stepsReveal.visible}
            />
            <StepCard
              number="2"
              title="AI Analysis"
              description="Our deep learning models analyze the image in seconds with high accuracy."
              delay={200}
              visible={stepsReveal.visible}
            />
            <StepCard
              number="3"
              title="Get Results"
              description="Receive detailed diagnosis, treatment suggestions, and prevention tips instantly."
              delay={400}
              visible={stepsReveal.visible}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section ref={statsReveal.ref} className="py-20 lg:py-24 bg-gradient-to-br from-primary-600 to-green-700 relative overflow-hidden">
        {/* Decorative bg elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white animate-float" />
          <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-white animate-float-delay" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white animate-float-slow" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div ref={counter1.ref} className={`transition-all duration-700 ${statsReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">{counter1.count}+</div>
              <div className="text-green-100 font-medium">AI Models</div>
            </div>
            <div ref={counter2.ref} className={`transition-all duration-700 delay-150 ${statsReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">{counter2.count}+</div>
              <div className="text-green-100 font-medium">Diseases Covered</div>
            </div>
            <div ref={counter3.ref} className={`transition-all duration-700 delay-300 ${statsReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">{counter3.count}%</div>
              <div className="text-green-100 font-medium">Accuracy Rate</div>
            </div>
            <div ref={counter4.ref} className={`transition-all duration-700 delay-500 ${statsReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">{counter4.count}/7</div>
              <div className="text-green-100 font-medium">Always Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section ref={ctaReveal.ref} className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-700 ${ctaReveal.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
              Ready to Protect Your Crops?
            </h2>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              Start using PlantGuard's AI-powered tools today to detect diseases early, identify pests, and keep your farm healthy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/disease"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-10 py-4 rounded-xl shadow-lg shadow-primary-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-lg"
              >
                Scan a Plant Now
              </Link>
              <Link
                to="/realtime"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-lg"
              >
                Open Live Monitor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} PlantGuard. AI-Powered Crop Protection for Modern Agriculture.</p>
        </div>
      </footer>

      {/* ═══════════════════ CSS KEYFRAMES ═══════════════════ */}
      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes spin-very-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-very-slow-reverse {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }

        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out both; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out 0.2s both; }
        .animate-fade-in-up-delay { animation: fade-in-up 0.8s ease-out 0.4s both; }
        .animate-fade-in-up-delay-2 { animation: fade-in-up 0.8s ease-out 0.6s both; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float 8s ease-in-out 2s infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out 1s infinite; }
        .animate-spin-very-slow { animation: spin-very-slow 30s linear infinite; }
        .animate-spin-very-slow-reverse { animation: spin-very-slow-reverse 45s linear infinite; }
      `}</style>
    </div>
  )
}
