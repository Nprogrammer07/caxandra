'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function VideoModal({
  videoId,
  title,
  onClose,
}: {
  videoId: string
  title: string
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      className="overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal vmodal">
        <div className="m-head">
          <h3>{title}</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>
        <div className="vplayer">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}