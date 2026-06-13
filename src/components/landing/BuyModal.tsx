'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { subscribeToPackage } from '@/app/actions/subscription'

export default function BuyModal({
  slug,
  name,
  price,
  isLoggedIn,
  onClose,
}: {
  slug: string
  name: string
  price: string
  isLoggedIn: boolean
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const pay = async () => {
    setLoading(true)
    setError(null)
    const res = await subscribeToPackage(slug)
    if (res.ok) {
      // Redirige a la pasarela de NOWPayments.
      window.location.href = res.url
    } else {
      setError(res.error)
      setLoading(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div
      className="overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal">
        <div className="m-head">
          <h3>Comprar con Crypto</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>

        <div className="m-body">
          <div className="m-row">
            <div>
              <div className="lbl">Plan seleccionado</div>
              <div className="val">{name}</div>
            </div>
            <div className="val price-val">{price} USD</div>
          </div>

          {isLoggedIn ? (
            <>
              <p style={{ color: 'var(--gray)', fontSize: '.88rem' }}>
                Te llevaremos a la pasarela segura de NOWPayments, donde eliges la criptomoneda y
                completas el pago. Tu plan se activa automáticamente al confirmarse.
              </p>
              {error && <div className="svc-feedback err">✗ {error}</div>}
            </>
          ) : (
            <div className="svc-login">
              <div className="svc-note">Debes iniciar sesión para comprar un plan.</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/login" className="btn btn-ghost">Iniciar sesión</Link>
                <Link href="/register" className="btn btn-primary">Registrarme</Link>
              </div>
            </div>
          )}
        </div>

        {isLoggedIn && (
          <div className="m-actions">
            <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
            <button className="btn btn-primary" onClick={pay} disabled={loading}>
              {loading ? 'Redirigiendo…' : 'Pagar con cripto'}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}