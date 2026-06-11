'use client'

import Link from 'next/link'
import { signOut } from '@/app/(auth)/actions'

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
            <>
              <span className="nav-avatar" title={user.email}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </span>
              <form action={signOut}>
                <button type="submit" className="nav-login">Cerrar sesión</button>
              </form>
            </>
          ) : (
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