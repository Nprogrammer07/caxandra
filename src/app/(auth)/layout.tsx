import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="auth-logo">
          <img src="/assets/logo.png" alt="Caxandra" width={44} height={44} />
          <span>CAX<b>ANDRA</b></span>
        </Link>
        {children}
      </div>
    </div>
  )
}