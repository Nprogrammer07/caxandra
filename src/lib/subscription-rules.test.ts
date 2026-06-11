import { describe, it, expect } from 'vitest'
import { canSubscribe } from './subscription-rules'

describe('canSubscribe', () => {
  it('sin plan activo, permite comprar cualquiera', () => {
    expect(canSubscribe(null, 1).allowed).toBe(true)
    expect(canSubscribe(null, 8).allowed).toBe(true)
  })

  it('con plan activo, permite mejorar a uno de mayor ritmo', () => {
    expect(canSubscribe(1, 3).allowed).toBe(true)
    expect(canSubscribe(3, 8).allowed).toBe(true)
  })

  it('con plan activo, bloquea comprar el MISMO plan', () => {
    expect(canSubscribe(3, 3).allowed).toBe(false)
  })

  it('con plan activo, bloquea bajar a uno menor', () => {
    expect(canSubscribe(8, 1).allowed).toBe(false)
    expect(canSubscribe(3, 1).allowed).toBe(false)
  })
})