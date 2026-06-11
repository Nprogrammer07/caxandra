'use client'

const toPlanes = () => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })

export default function Modules() {
  return (
    <section id="modulos">
      <div className="eyebrow">Herramientas</div>
      <h2 className="sec-title">Módulos especializados</h2>

      <div className="mod-grid" style={{ marginTop: 20 }}>
        <div className="mcard">
          <div className="glow" />
          <div className="micon">
            <svg width="74" height="74" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>ANÁLISIS PERSONALIZADO</h3>
          <p>Analiza tus partidos favoritos y recibe insights exclusivos.</p>
          <button className="btn btn-ghost" onClick={toPlanes}>Explorar módulo →</button>
        </div>

        <div className="mcard">
          <div className="glow" />
          <div className="micon">
            <svg width="74" height="74" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M12 3L1 9l11 6 9-4.9V17" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M5 12v5c0 1 3 3 7 3s7-2 7-3v-5" strokeLinecap="round" />
            </svg>
          </div>
          <h3>SEMINARIO ESPECIALIZADO</h3>
          <p>Aprende estrategias avanzadas de análisis deportivo.</p>
          <button className="btn btn-ghost" onClick={toPlanes}>Explorar seminario →</button>
        </div>
      </div>
    </section>
  )
}