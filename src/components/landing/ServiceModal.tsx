'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useActionState } from 'react'
import Link from 'next/link'
import { purchaseService } from '@/app/actions/services'

type Service = { slug: string; name: string; price_usd: number } | undefined

const INFO: Record<string, { features: string[]; hasMatch: boolean; cta: string }> = {
  analisis: {
    features: [
      'Análisis profesional del partido que elijas',
      'Estadísticas, contexto y nuestro pick',
      'Te llega por correo electrónico',
    ],
    hasMatch: true,
    cta: 'Pagar con cripto',
  },
  seminario: {
    features: [
      'Formación para maximizar tus ganancias',
      'Mentalidad y gestión dentro del negocio',
      'Acceso único, te llega por correo',
    ],
    hasMatch: false,
    cta: 'Pagar con cripto',
  },
}

export default function ServiceModal({
  slug,
  service,
  isLoggedIn,
  onClose,
}: {
  slug: string
  service: Service
  isLoggedIn: boolean
  onClose: () => void
}) {
  const info = INFO[slug]
  const [state, action, pending] = useActionState(purchaseService, null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Cuando la acción crea la factura, redirige a NOWPayments.
  useEffect(() => {
    if (state?.ok && state.url) {
      window.location.href = state.url
    }
  }, [state])

  const price = service ? Number(service.price_usd).toFixed(2) : ''

  return createPortal(
    <div
      className="overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal">
        <div className="m-head">
          <h3>{service?.name ?? 'Servicio'}</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>

        <div className="m-body">
          <div className="m-row">
            <div>
              <div className="lbl">Servicio</div>
              <div className="val">{service?.name}</div>
            </div>
            <div className="val price-val">{price} USD</div>
          </div>

          <ul className="svc-feats">
            {info.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          {!isLoggedIn ? (
            <div className="svc-login">
              <div className="svc-note">Debes iniciar sesión para comprar este servicio.</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/login" className="btn btn-ghost">Iniciar sesión</Link>
                <Link href="/register" className="btn btn-primary">Registrarme</Link>
              </div>
            </div>
          ) : state?.ok ? (
            <div className="svc-feedback ok">✓ Redirigiendo a la pasarela de pago…</div>
          ) : (
            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input type="hidden" name="slug" value={slug} />
              {info.hasMatch && (
                <input
                  className="svc-input"
                  name="requestText"
                  placeholder="Partido a analizar (ej. Real Madrid vs Barcelona)"
                  required
                />
              )}
              <div className="svc-note">No hay devoluciones una vez realizada la compra.</div>
              {state && !state.ok && <div className="svc-feedback err">✗ {state.error}</div>}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={pending}
                style={{ justifyContent: 'center' }}
              >
                {pending ? 'Procesando…' : info.cta}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}