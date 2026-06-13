import { describe, it, expect } from 'vitest'
import { verifyIpnSignature } from './nowpayments'

// Vector real: firma calculada con secret 'test-secret' sobre estos params.
const SECRET = 'test-secret'
const PARAMS = {
  payment_status: 'finished',
  order_id: 'abc123',
  price_amount: 4.99,
  pay_currency: 'btc',
}
const VALID_SIG =
  'bb0c52901055bffdfb45024f547c69cdf0dbbab1a1f4f6d9d16088c3ac7003bb08e29dff8f119e053d23f4f86db204d6df20ebe107157e2e64469bb93ad01ab2'

describe('verifyIpnSignature', () => {
  it('acepta una firma válida (sin importar el orden de las claves)', () => {
    // mismas claves en otro orden -> debe seguir validando
    const reordered = {
      pay_currency: 'btc',
      price_amount: 4.99,
      order_id: 'abc123',
      payment_status: 'finished',
    }
    expect(verifyIpnSignature(reordered, VALID_SIG, SECRET)).toBe(true)
  })

  it('rechaza una firma incorrecta', () => {
    expect(verifyIpnSignature(PARAMS, 'deadbeef'.repeat(16), SECRET)).toBe(false)
  })

  it('rechaza si el secret es otro', () => {
    expect(verifyIpnSignature(PARAMS, VALID_SIG, 'otro-secret')).toBe(false)
  })

  it('rechaza si los datos fueron alterados', () => {
    const tampered = { ...PARAMS, price_amount: 0.01 }
    expect(verifyIpnSignature(tampered, VALID_SIG, SECRET)).toBe(false)
  })

  it('rechaza si no hay firma', () => {
    expect(verifyIpnSignature(PARAMS, null, SECRET)).toBe(false)
  })
})