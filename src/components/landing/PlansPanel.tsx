'use client'

import { useState } from 'react'
import BuyModal from './BuyModal'

type Buy = { slug: string; name: string; price: string }

export default function PlansPanel({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [buy, setBuy] = useState<Buy | null>(null)

  return (
    <>
      <div className="plans">
        <div className="plans-head">PLANES PREMIUM</div>

        <div className="plan">
          <div className="qty">30 PREDICCIONES</div>
          <div className="per">Mensuales</div>
          <div className="price"><span className="cur">$</span>1.99</div>
          <div className="unit">USD / mes</div>
          <button
            className="btn btn-ghost buy"
            onClick={() => setBuy({ slug: 'p30', name: '30 Predicciones Mensuales', price: '1.99' })}
          >
            <CardIcon /> Comprar con Crypto
          </button>
        </div>

        <div className="plan featured">
          <div className="ribbon">POPULAR</div>
          <div className="qty">90 PREDICCIONES</div>
          <div className="per">Mensuales</div>
          <div className="price"><span className="cur">$</span>4.99</div>
          <div className="unit">USD / mes</div>
          <button
            className="btn btn-primary buy"
            onClick={() => setBuy({ slug: 'p90', name: '90 Predicciones Mensuales', price: '4.99' })}
          >
            <CardIcon /> Comprar con Crypto
          </button>
        </div>

        <div className="plan">
          <div className="qty">240 PREDICCIONES</div>
          <div className="per">Mensuales</div>
          <div className="price"><span className="cur">$</span>8.99</div>
          <div className="unit">USD / mes</div>
          <button
            className="btn btn-ghost buy"
            onClick={() => setBuy({ slug: 'p240', name: '240 Predicciones Mensuales', price: '8.99' })}
          >
            <CardIcon /> Comprar con Crypto
          </button>
        </div>

        <div className="secure">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          Pago 100% seguro con criptomonedas
        </div>
      </div>

      {buy && (
        <BuyModal
          slug={buy.slug}
          name={buy.name}
          price={buy.price}
          isLoggedIn={isLoggedIn}
          onClose={() => setBuy(null)}
        />
      )}
    </>
  )
}

function CardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}