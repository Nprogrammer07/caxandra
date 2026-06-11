'use client'

export default function Nav() {
  const toPlanes = () => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <header className="nav">
      <div className="wrap nav-in">
        <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img className="mark" src="/assets/logo.png" alt="Caxandra" width={40} height={40} />
          <div><div className="txt">CAX<b>ANDRA</b></div></div>
        </div>

        <nav className="nav-links">
          <a href="#hero">Inicio</a>
          <a href="#videos">Análisis</a>
          <a href="#modulos">Módulos</a>
          <a href="#planes">Planes</a>
        </nav>

        <button className="nav-cta" onClick={toPlanes}>Ver Planes</button>
        <button className="burger" aria-label="Menú" onClick={toPlanes}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}