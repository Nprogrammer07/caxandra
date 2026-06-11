'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function VideoModal({ title, onClose }: { title: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    // Arranca la barra de progreso un instante después de montar (0% -> 100%).
    const t = setTimeout(() => setProgress(100), 50)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = ''
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal vmodal">
        <div className="m-head">
          <h3>{title}</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="vplayer">
          <div className="img" style={{ backgroundImage: 'linear-gradient(120deg,#0a1f0f,#06120c)' }} />
          <div className="pp">
            <div style={{ marginBottom: 8 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#b8ff20"><path d="M8 5v14l11-7z" /></svg>
            </div>
            Reproducción simulada
          </div>
          {/* La barra crece de 0 a 100% en 8s gracias a la transición CSS. */}
          <div className="pbar" style={{ width: `${progress}%`, transition: 'width 8s linear' }} />
        </div>
      </div>
    </div>,
    document.body
  )
}