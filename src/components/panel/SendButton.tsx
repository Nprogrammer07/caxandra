'use client'

import { useActionState } from 'react'
import { sendToday } from '@/app/panel/actions'

export default function SendButton() {
  const [state, action, pending] = useActionState(sendToday, null)

  return (
    <form action={action}>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Enviando…' : 'Enviar pronósticos de hoy'}
      </button>
      {state && (
        <p className={`send-result ${state.ok ? 'ok' : 'err'}`}>
          {state.ok
            ? `✓ Enviado a ${state.usersNotified} usuario(s) · ${state.totalDeliveries} entrega(s)${state.emailsFailed ? ` · ${state.emailsFailed} fallo(s)` : ''}`
            : `✗ ${state.error}`}
        </p>
      )}
    </form>
  )
}