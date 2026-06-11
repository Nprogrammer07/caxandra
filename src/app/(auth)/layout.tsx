import Link from 'next/link'
import Background from '@/components/landing/Background'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Background />
      <div className="auth-wrap">
        <div className="auth-card">
          <Link href="/" className="auth-back">← Volver al inicio</Link>
          <Link href="/" className="auth-logo">
            <img src="/assets/logo.png" alt="Caxandra" width={44} height={44} />
            <span>CAX<b>ANDRA</b></span>
          </Link>
          <div className="auth-tag">DATOS · ANÁLISIS · PREDICCIÓN · <span>GANANCIA</span></div>
          {children}
        </div>
      </div>
    </>
  )
}