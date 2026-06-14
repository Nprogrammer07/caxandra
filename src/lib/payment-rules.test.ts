import { describe, it, expect } from 'vitest'
import { validateServicePurchase, decideFulfillment } from './payment-rules'

describe('validateServicePurchase', () => {
  it('rechaza un análisis sin partido', () => {
    const r = validateServicePurchase({ serviceSlug: 'analisis', requestText: '   ', oncePerUser: false, alreadyOwned: false })
    expect(r.ok).toBe(false)
  })

  it('acepta un análisis con partido', () => {
    const r = validateServicePurchase({ serviceSlug: 'analisis', requestText: 'Madrid vs Barça', oncePerUser: false, alreadyOwned: false })
    expect(r.ok).toBe(true)
  })

  it('permite recomprar el análisis aunque ya tenga uno (es repetible)', () => {
    const r = validateServicePurchase({ serviceSlug: 'analisis', requestText: 'Otro partido', oncePerUser: false, alreadyOwned: true })
    expect(r.ok).toBe(true)
  })

  it('bloquea el seminario si ya lo adquirió (una sola vez)', () => {
    const r = validateServicePurchase({ serviceSlug: 'seminario', requestText: '', oncePerUser: true, alreadyOwned: true })
    expect(r.ok).toBe(false)
  })

  it('permite el seminario la primera vez', () => {
    const r = validateServicePurchase({ serviceSlug: 'seminario', requestText: '', oncePerUser: true, alreadyOwned: false })
    expect(r.ok).toBe(true)
  })
})

describe('decideFulfillment', () => {
  const base = { serviceOrderId: null, packageId: null, alreadyFulfilled: false }

  it('no hace nada si el pago no está finished', () => {
    expect(decideFulfillment({ ...base, status: 'waiting', packageId: 'pkg1' }).action).toBe('none')
    expect(decideFulfillment({ ...base, status: 'confirming', packageId: 'pkg1' }).action).toBe('none')
  })

  it('no reactiva un pago ya cumplido (idempotencia)', () => {
    const r = decideFulfillment({ ...base, status: 'finished', alreadyFulfilled: true, packageId: 'pkg1' })
    expect(r.action).toBe('none')
  })

  it('activa el servicio cuando el pago finished es de una orden', () => {
    const r = decideFulfillment({ ...base, status: 'finished', serviceOrderId: 'ord1' })
    expect(r).toEqual({ action: 'activate_service', serviceOrderId: 'ord1' })
  })

  it('crea la suscripción cuando el pago finished es de un plan', () => {
    const r = decideFulfillment({ ...base, status: 'finished', packageId: 'pkg1' })
    expect(r).toEqual({ action: 'create_subscription', packageId: 'pkg1' })
  })

  it('no hace nada si finished pero no hay ni orden ni plan', () => {
    expect(decideFulfillment({ ...base, status: 'finished' }).action).toBe('none')
  })
})