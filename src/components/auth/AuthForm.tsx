'use client'

import { useActionState } from 'react'
import type { AuthState } from '@/app/(auth)/actions'

// La acción recibe el estado previo y el formulario, y devuelve un nuevo estado.
type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>

export default function AuthForm({
  action,
  submitLabel,
}: {
  action: Action
  submitLabel: string
}) {
  // useActionState conecta el formulario con la Server Action.
  // - state: lo último que devolvió la acción (error o success)
  // - formAction: lo que le pasamos al <form>
  // - pending: true mientras la acción está corriendo
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="auth-form">
      <label className="auth-field">
        <span>Correo electrónico</span>
        <input type="email" name="email" required autoComplete="email" placeholder="tu@correo.com" />
      </label>

      <label className="auth-field">
        <span>Contraseña</span>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </label>

      {state.error && <p className="auth-msg error">{state.error}</p>}
      {state.success && <p className="auth-msg ok">{state.success}</p>}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={pending}
        style={{ justifyContent: 'center' }}
      >
        {pending ? 'Procesando…' : submitLabel}
      </button>
    </form>
  )
}