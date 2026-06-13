'use client'

import Link from 'next/link'
import { signOut } from '@/app/(auth)/actions'

type NavUser = { email?: string } | null

export default function Nav({
  user,
  predictionsLeft,
  isAdmin,
}: {
  user: NavUser
  predictionsLeft?: number | null
  isAdmin?: boolean
}) {
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

              {isAdmin && (
                <Link href="/panel" className="nav-panel" title="Panel de administración" aria-label="Panel">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M9 3v18M4 9h5M4 15h5" />
                  </svg>
                </Link>
              )}

              {predictionsLeft != null && (
                <span className="nav-credits" title="Pronósticos restantes">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
                  </svg>
                  {predictionsLeft}
                </span>
              )}
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