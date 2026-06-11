'use client'

import Link from 'next/link'

type NavUser = { email?: string } | null

export default function Nav({ user }: { user: NavUser }) {
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

        <div className="nav-auth">
          {user ? (
            // Con sesión: acceso directo al panel.
            <Link href="/dashboard" className="nav-cta">Mi panel</Link>
          ) : (
            // Sin sesión: entrar o registrarse.
            <>
              <Link href="/login" className="nav-login">Iniciar sesión</Link>
              <Link href="/register" className="nav-cta">Registrarme</Link>
            </>
          )}
        </div>

        <button className="burger" aria-label="Menú" onClick={toPlanes}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}