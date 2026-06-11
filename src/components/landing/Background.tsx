'use client'

import { useEffect, useRef } from 'react'

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const cx = cv.getContext('2d')
    if (!cx) return

    let W = 0
    let H = 0
    const resize = () => {
      W = cv.width = window.innerWidth
      H = cv.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 46 partículas flotando con velocidad y tamaño aleatorios.
    const pts = Array.from({ length: 46 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.4,
    }))

    let raf = 0
    const draw = () => {
      cx.clearRect(0, 0, W, H)
      // Dibuja cada partícula y la rebota contra los bordes.
      pts.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        cx.beginPath()
        cx.arc(p.x, p.y, p.r, 0, 7)
        cx.fillStyle = 'rgba(184,255,32,.5)'
        cx.fill()
      })
      // Une con líneas las partículas que estén cerca (efecto "red").
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i]
          const b = pts[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 120) {
            cx.beginPath()
            cx.moveTo(a.x, a.y)
            cx.lineTo(b.x, b.y)
            cx.strokeStyle = `rgba(184,255,32,${0.12 * (1 - d / 120)})`
            cx.lineWidth = 0.6
            cx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    // LIMPIEZA: al desmontar, quitamos el listener y paramos la animación.
    // Sin esto, el bucle seguiría corriendo y consumiría memoria.
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="bg-fx">
        <div className="grid" />
        <div className="glow-a" />
        <div className="glow-b" />
      </div>
      <canvas id="particles" ref={canvasRef} />
    </>
  )
}