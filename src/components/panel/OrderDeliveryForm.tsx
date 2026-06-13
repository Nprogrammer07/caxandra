'use client'

import { useActionState } from 'react'
import { deliverServiceOrder } from '@/app/panel/actions'

export default function OrderDeliveryForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(deliverServiceOrder, null)

  return (
    <form action={action} className="order-form">
      <input type="hidden" name="orderId" value={orderId} />
      <textarea
        name="message"
        placeholder="Mensaje opcional para el usuario…"
        className="order-msg"
        rows={2}
      />
      <div className="order-form-foot">
        <label className="pred-filewrap">
          <span className="pred-filelabel">Adjuntar PDF del contenido</span>
          <input type="file" name="pdf" accept="application/pdf" required />
        </label>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Enviando…' : 'Enviar y marcar entregado'}
        </button>
      </div>

      {state && !state.ok && <p className="order-feedback err">✗ {state.error}</p>}
    </form>
  )
}