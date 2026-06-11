import Link from 'next/link'
import AuthForm from '@/app/auth/AuthForm'
import { signup } from '../actions'

export default function RegisterPage() {
  return (
    <>
      <h1 className="auth-title">Crear cuenta</h1>
      <p className="auth-sub">Únete y empieza a recibir predicciones profesionales.</p>
      <AuthForm action={signup} submitLabel="Registrarme" />
      <p className="auth-alt">¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></p>
    </>
  )
}