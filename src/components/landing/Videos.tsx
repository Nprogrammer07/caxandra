'use client'

import { useState } from 'react'
import VideoModal from './VideoModal'

// VIDEO FIJO: reemplaza el ID por el de tu video de YouTube fijo.
// (el ID es lo que va después de "watch?v=" en la URL)
const FIXED_VIDEO = { id: 'YrLAix2KTuk', title: 'Bienvenido a Caxandra' }

const thumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`

export default function Videos({ weeklyVideoId }: { weeklyVideoId: string | null }) {
  const [open, setOpen] = useState<{ id: string; title: string } | null>(null)

  return (
    <section id="videos">
      <div className="eyebrow">Contenido</div>
      <h2 className="sec-title">Análisis y predicciones en video</h2>
      <p className="sec-sub">
        Mira los últimos desgloses tácticos y los pronósticos más fuertes de la semana.
      </p>

      <div className="video-grid" style={{ marginTop: 20 }}>
        {/* Video fijo */}
        <div className="vcard v1" onClick={() => setOpen(FIXED_VIDEO)}>
          <div className="img" style={{ backgroundImage: `url(${thumb(FIXED_VIDEO.id)})` }} />
          <div className="meta"><h3>{FIXED_VIDEO.title}</h3></div>
          <div className="play">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <div className="vbadge"><span className="dot" /> Ver video</div>
        </div>

        {/* Video semanal (viene de la base de datos, editable desde el panel) */}
        {weeklyVideoId && (
          <div
            className="vcard v2"
            onClick={() => setOpen({ id: weeklyVideoId, title: 'Pronóstico de la semana' })}
          >
            <div className="img" style={{ backgroundImage: `url(${thumb(weeklyVideoId)})` }} />
            <div className="meta"><h3>Pronóstico de la semana</h3></div>
            <div className="play">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <div className="vbadge"><span className="dot" /> Ver video</div>
          </div>
        )}
      </div>

      {open && <VideoModal videoId={open.id} title={open.title} onClose={() => setOpen(null)} />}
    </section>
  )
}