import Link from 'next/link'
import AuthForm from '@/app/auth/AuthForm'
import { login } from './actions'

export default function LoginPage() {
  return (
    <>
      <h1 className="auth-title">Iniciar sesión</h1>
      <p className="auth-sub">Accede a tus pronósticos premium.</p>
      <AuthForm action={login} submitLabel="Entrar" />
      <p className="auth-alt">¿No tienes cuenta? <Link href="/register">Regístrate</Link></p>
    </>
  )
}