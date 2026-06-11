'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

type Coin = 'BTC' | 'ETH' | 'USDT'

// Direcciones de ejemplo (simuladas). En la Fase 7 las dará el procesador de pago real.
const WALLETS: Record<Coin, string> = {
  BTC: 'bc1qCAxANDRAq8s7v3z9k2m4n6p8r0t2y4w6e8',
  ETH: '0xCAxANDRA1234567890abcdef1234567890abcd',
  USDT: 'TCAxANDRAxK9p2m4n6q8s1v3z5b7d9f0h2j4l6',
}

const COINS: { id: Coin; name: string; tag: string }[] = [
  { id: 'BTC', name: 'Bitcoin', tag: 'BTC' },
  { id: 'ETH', name: 'Ethereum', tag: 'ETH' },
  { id: 'USDT', name: 'USDT', tag: 'TRC20' },
]

// Genera un patrón tipo QR (solo decorativo, NO es un QR real).
function buildQr(): boolean[] {
  const N = 21
  const cells: boolean[] = []
  let seed = 7
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let on = false
      if ((r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)) {
        const rr = r < 7 ? r : r - 14
        const cc = c < 7 ? c : c > 13 ? c - 14 : c
        on = rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4)
      } else {
        on = rnd() > 0.55
      }
      cells.push(on)
    }
  }
  return cells
}

export default function BuyModal({
  plan,
  price,
  onClose,
}: {
  plan: string
  price: string
  onClose: () => void
}) {
  const [coin, setCoin] = useState<Coin>('BTC')
  const [status, setStatus] = useState<'idle' | 'processing' | 'paid'>('idle')
  const [copied, setCopied] = useState(false)

  // El portal necesita document.body, que solo existe en el navegador.
  // Esperamos a estar montados en el cliente antes de renderizar.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // useMemo: calcula el QR una sola vez y no en cada redibujado.
  const qr = useMemo(() => buildQr(), [])
  const wallet = WALLETS[coin]

  // useEffect: bloquea el scroll del fondo mientras el modal está abierto,
  // y lo restaura cuando se cierra (eso hace el "return").
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const copy = () => {
    navigator.clipboard?.writeText(wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const simulate = () => {
    setStatus('processing')
    setTimeout(() => setStatus('paid'), 2600)
  }

  if (!mounted) return null

  return createPortal(
    // Cerrar al hacer clic fuera del modal (en el fondo oscuro).
    <div className="overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal${status === 'paid' ? ' paid' : ''}`}>
        <div className="m-head">
          <h3>Comprar con Crypto</h3>
          <button className="m-close" onClick={onClose}>✕</button>
        </div>

        <div className="m-body">
          <div className="m-row">
            <div>
              <div className="lbl">Plan seleccionado</div>
              <div className="val">{plan}</div>
            </div>
            <div className="val price-val">{price} USD</div>
          </div>

          <div className="m-block">
            <div className="ttl">Paga con cualquiera de estas criptomonedas</div>
            <div className="coins">
              {COINS.map((c) => (
                <div
                  key={c.id}
                  className={`coin${coin === c.id ? ' active' : ''}`}
                  onClick={() => setCoin(c.id)}
                >
                  <div className="cn">{c.name}</div>
                  <div className="ct">{c.tag}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="m-block">
            <div className="ttl">Dirección de wallet</div>
            <div className="wallet">
              <code>{wallet}</code>
              <button className="cp" onClick={copy} aria-label="Copiar">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                </svg>
              </button>
            </div>
          </div>

          <div className="qr-zone">
            <div className="qr">
              <div className="qr-grid">
                {qr.map((on, i) => (
                  <i key={i} className={on ? 'on' : undefined} />
                ))}
              </div>
            </div>
            <div className="status">
              <div className="st-lbl">Estado del pago</div>
              <div className="st-row">
                {status === 'paid' ? (
                  <div className="check" style={{ display: 'flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4 10-10" />
                    </svg>
                  </div>
                ) : (
                  <div className="spinner" />
                )}
                <div className="st-txt">
                  {status === 'idle' && 'Esperando pago…'}
                  {status === 'processing' && 'Verificando en la red…'}
                  {status === 'paid' && 'Pago confirmado ✓'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="m-actions">
          <button className="btn btn-ghost" onClick={copy}>
            {copied ? '¡Copiado!' : 'Copiar dirección'}
          </button>
          <button
            className="btn btn-primary"
            onClick={simulate}
            disabled={status !== 'idle'}
            style={status !== 'idle' ? { opacity: 0.6 } : undefined}
          >
            {status === 'idle' && 'Simular pago'}
            {status === 'processing' && 'Procesando…'}
            {status === 'paid' && 'Acceso activado'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}