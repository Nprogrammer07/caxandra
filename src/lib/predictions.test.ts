import { describe, it, expect } from 'vitest'
import { selectPredictionsForUser, type DayPrediction } from './predictions'

// Un set COMPLETO de 8 pronósticos (posiciones 1..8) para un día.
const fullDay: DayPrediction[] = Array.from({ length: 8 }, (_, i) => ({
  id: `p${i + 1}`,
  position: i + 1,
}))

describe('selectPredictionsForUser', () => {
  it('plan de 1 diario recibe solo la posición 1', () => {
    const r = selectPredictionsForUser({ dailyRate: 1, remaining: 30, predictions: fullDay })
    expect(r.toDeliver.map((p) => p.position)).toEqual([1])
    expect(r.newRemaining).toBe(29)
    expect(r.expired).toBe(false)
  })

  it('plan de 3 diarios recibe las posiciones 1, 2 y 3', () => {
    const r = selectPredictionsForUser({ dailyRate: 3, remaining: 90, predictions: fullDay })
    expect(r.toDeliver.map((p) => p.position)).toEqual([1, 2, 3])
    expect(r.newRemaining).toBe(87)
  })

  it('plan de 8 diarios recibe las 8 posiciones', () => {
    const r = selectPredictionsForUser({ dailyRate: 8, remaining: 240, predictions: fullDay })
    expect(r.toDeliver).toHaveLength(8)
    expect(r.newRemaining).toBe(232)
  })

  it('NUNCA entrega más pronósticos que el saldo restante', () => {
    // Le quedan 2, plan de 8: recibe solo 2 (posiciones 1 y 2) y queda vencida.
    const r = selectPredictionsForUser({ dailyRate: 8, remaining: 2, predictions: fullDay })
    expect(r.toDeliver.map((p) => p.position)).toEqual([1, 2])
    expect(r.newRemaining).toBe(0)
    expect(r.expired).toBe(true)
  })

  it('si el día tiene menos pronósticos que el ritmo, entrega los disponibles', () => {
    const partialDay = fullDay.slice(0, 5) // solo posiciones 1..5
    const r = selectPredictionsForUser({ dailyRate: 8, remaining: 240, predictions: partialDay })
    expect(r.toDeliver).toHaveLength(5)
    expect(r.newRemaining).toBe(235)
  })

  it('no reenvía un pronóstico ya entregado (idempotencia)', () => {
    // La posición 1 ya se envió: con plan de 3, hoy solo recibe 2 y 3.
    const r = selectPredictionsForUser({
      dailyRate: 3,
      remaining: 90,
      predictions: fullDay,
      alreadyDelivered: ['p1'],
    })
    expect(r.toDeliver.map((p) => p.position)).toEqual([2, 3])
    expect(r.newRemaining).toBe(88)
  })

  it('con saldo 0 no entrega nada y está vencida', () => {
    const r = selectPredictionsForUser({ dailyRate: 8, remaining: 0, predictions: fullDay })
    expect(r.toDeliver).toEqual([])
    expect(r.expired).toBe(true)
  })

  it('ignora posiciones por encima del ritmo del plan', () => {
    // plan de 1: aunque existan 8 pronósticos, solo la posición 1 es elegible.
    const r = selectPredictionsForUser({ dailyRate: 1, remaining: 30, predictions: fullDay })
    expect(r.toDeliver.every((p) => p.position <= 1)).toBe(true)
  })
})