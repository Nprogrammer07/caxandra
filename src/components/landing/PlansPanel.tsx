'use client'

import { useState } from 'react'
import BuyModal from './BuyModal'
import type { Package } from '@/types'

export default function PlansPanel({ packages }: { packages: Package[] }) {
  const [buy, setBuy] = useState<{ id: string; plan: string; price: string } | null>(null)

  return (
    <>
      <div className="plans">
        <div className="plans-head">PLANES PREMIUM</div>

        {packages.map((pkg) => {
          // El plan de 90 (ritmo 3) lo marcamos como destacado.
          const featured = pkg.daily_rate === 3
          return (
            <div key={pkg.id} className={`plan${featured ? ' featured' : ''}`}>
              {featured && <div className="ribbon">POPULAR</div>}
              <div className="qty">{pkg.total_predictions} PREDICCIONES</div>
              <div className="per">Mensuales</div>
              <div className="price"><span className="cur">$</span>{pkg.price_usd.toFixed(2)}</div>
              <div className="unit">USD / mes</div>
              <button
                className={`btn ${featured ? 'btn-primary' : 'btn-ghost'} buy`}
                onClick={() => setBuy({ id: pkg.id, plan: pkg.name, price: pkg.price_usd.toFixed(2) })}
              >
                <CardIcon /> Comprar con Crypto
              </button>
            </div>
          )
        })}

        <div className="secure">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          Pago 100% seguro con criptomonedas
        </div>
      </div>

      {buy && <BuyModal packageId={buy.id} plan={buy.plan} price={buy.price} onClose={() => setBuy(null)} />}
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