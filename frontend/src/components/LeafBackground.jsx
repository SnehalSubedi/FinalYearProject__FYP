import { useEffect, useRef } from 'react'

/**
 * Subtle animated background with floating leaves and soft particles.
 * Renders a fixed, full-screen canvas behind page content.
 */
export default function LeafBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, animId

    const dpr = Math.min(window.devicePixelRatio, 2)

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Floating leaf particles
    const leafCount = 18
    const leaves = Array.from({ length: leafCount }, () => ({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      size: 8 + Math.random() * 14,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.012,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: 0.15 + Math.random() * 0.35,
      opacity: 0.04 + Math.random() * 0.07,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.3 + Math.random() * 0.5,
      color: ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7', '#2e7d32'][Math.floor(Math.random() * 5)],
    }))

    // Soft glowing dots
    const dotCount = 30
    const dots = Array.from({ length: dotCount }, () => ({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      size: 1 + Math.random() * 2.5,
      speedY: -(0.08 + Math.random() * 0.2),
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: 0.06 + Math.random() * 0.1,
      phase: Math.random() * Math.PI * 2,
    }))

    function drawLeaf(x, y, size, rotation, opacity, color) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.globalAlpha = opacity
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(size * 0.4, -size * 0.25, size * 0.8, -size * 0.15, size, 0)
      ctx.bezierCurveTo(size * 0.8, size * 0.15, size * 0.4, size * 0.25, 0, 0)
      ctx.fillStyle = color
      ctx.fill()

      // Vein
      ctx.beginPath()
      ctx.moveTo(size * 0.1, 0)
      ctx.lineTo(size * 0.85, 0)
      ctx.strokeStyle = color
      ctx.lineWidth = 0.5
      ctx.globalAlpha = opacity * 0.5
      ctx.stroke()
      ctx.restore()
    }

    function animate(time) {
      animId = requestAnimationFrame(animate)
      const t = time / 1000

      ctx.clearRect(0, 0, w, h)

      // Draw dots
      dots.forEach((d) => {
        d.y += d.speedY
        d.x += d.speedX + Math.sin(t * 0.5 + d.phase) * 0.05
        if (d.y < -10) { d.y = h + 10; d.x = Math.random() * w }
        if (d.x < -10) d.x = w + 10
        if (d.x > w + 10) d.x = -10

        const pulse = 0.7 + Math.sin(t * 1.5 + d.phase) * 0.3
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(76, 175, 80, ${d.opacity * pulse})`
        ctx.fill()
      })

      // Draw leaves
      leaves.forEach((l) => {
        l.y += l.speedY
        l.x += l.speedX + Math.sin(t * l.wobbleSpeed + l.wobblePhase) * 0.4
        l.rotation += l.rotSpeed

        if (l.y > h + 30) {
          l.y = -30
          l.x = Math.random() * w
        }
        if (l.x < -30) l.x = w + 30
        if (l.x > w + 30) l.x = -30

        drawLeaf(l.x, l.y, l.size, l.rotation, l.opacity, l.color)
      })
    }

    animId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}
