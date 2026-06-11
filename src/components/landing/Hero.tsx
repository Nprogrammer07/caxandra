'use client'

// Helper para hacer scroll suave a una sección por su id.
// El "?." evita que truene si la sección aún no existe (las creamos después).
const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-grid">
        <div>
          <div className="hero-logo">
            <img className="mark" src="/assets/logo.png" alt="Caxandra" width={48} height={48} />
            <div>
              <span className="name">CAX<b>ANDRA</b></span>
              <span className="tag">DATOS · ANÁLISIS · PREDICCIÓN · <span>GANANCIA</span></span>
            </div>
          </div>

          <div className="eyebrow">Plataforma de pronósticos</div>
          <h1>Predicciones deportivas <span className="accent">profesionales</span></h1>
          <p className="lead">
            Análisis avanzados, estadísticas y predicciones premium para fanáticos del fútbol.
          </p>

          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => scrollTo('planes')}>
              Ver Planes
            </button>
            <button className="btn btn-ghost" onClick={() => scrollTo('videos')}>
              Explorar Predicciones
            </button>
          </div>
        </div>

        <div className="orb-wrap">
          <div className="orb-ring" />
          <div className="orb" id="orb">
            <svg viewBox="0 0 200 200">
              <circle className="ball-rim" cx="100" cy="100" r="80" />
              <g className="ball-panel">
                <path d="M100,70 L128.5,90.7 L117.6,124.3 L82.4,124.3 L71.5,90.7 Z" />
                <path d="M145.9,36.9 L152.4,57.1 L135.3,69.5 L118.2,57.1 L124.7,36.9 Z" />
                <path d="M174.2,124.1 L157.1,136.5 L140,124.1 L146.5,103.9 L167.7,103.9 Z" />
                <path d="M100,178 L82.9,165.6 L89.4,145.4 L110.6,145.4 L117.1,165.6 Z" />
                <path d="M25.8,124.1 L32.3,103.9 L53.5,103.9 L60,124.1 L42.9,136.5 Z" />
                <path d="M54.1,36.9 L75.3,36.9 L81.8,57.1 L64.7,69.5 L47.6,57.1 Z" />
              </g>
              <g className="ball-seam">
                <path d="M135.3,69.5 L128.5,90.7" /><path d="M118.2,57.1 L100,70" />
                <path d="M140,124.1 L117.6,124.3" /><path d="M146.5,103.9 L128.5,90.7" />
                <path d="M89.4,145.4 L82.4,124.3" /><path d="M110.6,145.4 L117.6,124.3" />
                <path d="M53.5,103.9 L71.5,90.7" /><path d="M60,124.1 L82.4,124.3" />
                <path d="M81.8,57.1 L100,70" /><path d="M64.7,69.5 L71.5,90.7" />
              </g>
            </svg>
            <div className="orb-spark" style={{ top: '8%', left: '50%' }} />
            <div className="orb-spark" style={{ top: '50%', right: '4%' }} />
            <div className="orb-spark" style={{ bottom: '6%', left: '38%' }} />
          </div>
        </div>
      </div>

      <div className="benefits">
        <div className="bcard">
          <div className="ic">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
          </div>
          <h4>Alta precisión</h4>
          <p>Modelos validados con histórico real de partidos.</p>
        </div>
        <div className="bcard">
          <div className="ic">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
            </svg>
          </div>
          <h4>Análisis avanzado</h4>
          <p>Estadísticas profundas por equipo y jugador.</p>
        </div>
        <div className="bcard">
          <div className="ic">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18" />
            </svg>
          </div>
          <h4>Cobertura internacional</h4>
          <p>Ligas y torneos de todo el mundo.</p>
        </div>
        <div className="bcard">
          <div className="ic">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-3-6.7M21 3v5h-5" />
            </svg>
          </div>
          <h4>Actualizaciones constantes</h4>
          <p>Datos en tiempo real antes de cada jornada.</p>
        </div>
      </div>
    </section>
  )
}