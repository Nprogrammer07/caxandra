'use client'

import { useState } from 'react'
import VideoModal from './VideoModal'

// Fondos de "cancha" en SVG, codificados de forma segura para usarse como imagen CSS.
// encodeURIComponent garantiza que caracteres como # o las comillas no rompan el url().
const stadium1 = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250'><rect width='400' height='250' fill='#071a0d'/><rect y='150' width='400' height='100' fill='#0a2a12'/><g stroke='#b8ff20' stroke-width='1' opacity='0.25'><line x1='200' y1='150' x2='200' y2='250'/><circle cx='200' cy='250' r='40' fill='none'/></g></svg>`,
)}`

const stadium2 = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250'><rect width='400' height='250' fill='#061509'/><rect y='160' width='400' height='90' fill='#0b2e14'/><circle cx='300' cy='120' r='30' fill='none' stroke='#b8ff20' opacity='0.3'/></svg>`,
)}`

export default function Videos() {
  // Qué video está abierto (su título), o null si ninguno. Mismo patrón que el modal de compra.
  const [video, setVideo] = useState<string | null>(null)

  return (
    <section id="videos">
      <div className="eyebrow">Contenido</div>
      <h2 className="sec-title">Análisis y predicciones en video</h2>
      <p className="sec-sub">
        Mira los últimos desgloses tácticos y los pronósticos más fuertes de la semana.
      </p>

      <div className="video-grid" style={{ marginTop: 20 }}>
        <div className="vcard v1" onClick={() => setVideo('Últimos análisis deportivos')}>
          <div className="img" />
          <div className="stadium" style={{ backgroundImage: `url("${stadium1}")` }} />
          <div className="meta"><h3>Últimos análisis deportivos</h3></div>
          <div className="play">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <div className="vbadge"><span className="dot" /> Ver video</div>
        </div>

        <div className="vcard v2" onClick={() => setVideo('Predicciones destacadas de la semana')}>
          <div className="img" />
          <div className="stadium" style={{ backgroundImage: `url("${stadium2}")` }} />
          <div className="meta"><h3>Predicciones destacadas de la semana</h3></div>
          <div className="play">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
          </div>
          <div className="vbadge"><span className="dot" /> Ver video</div>
        </div>
      </div>

      {video && <VideoModal title={video} onClose={() => setVideo(null)} />}
    </section>
  )
}