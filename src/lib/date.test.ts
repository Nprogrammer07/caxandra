import { describe, it, expect } from 'vitest'
import { toColombiaDateString } from './date'

describe('toColombiaDateString', () => {
  it('de madrugada UTC, en Colombia todavía es el día anterior', () => {
    // 02:00 UTC del 11 = 21:00 del 10 en Colombia
    expect(toColombiaDateString(new Date('2026-06-11T02:00:00Z'))).toBe('2026-06-10')
  })

  it('de día UTC, es el mismo día en Colombia', () => {
    // 10:00 UTC del 11 = 05:00 del 11 en Colombia
    expect(toColombiaDateString(new Date('2026-06-11T10:00:00Z'))).toBe('2026-06-11')
  })

  it('maneja bien el cambio de mes', () => {
    // 01 jul 03:00 UTC = 30 jun 22:00 Colombia
    expect(toColombiaDateString(new Date('2026-07-01T03:00:00Z'))).toBe('2026-06-30')
  })
})