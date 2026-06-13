// Simula un webhook "finished" de NOWPayments, firmado con tu IPN secret.
// Sirve para probar que el webhook activa el acceso SIN pagar cripto real.
//
// Uso:
//   NOWPAYMENTS_IPN_SECRET=tu_secret node scripts/test-webhook.mjs <payments.id> [SITE_URL]
//
// <payments.id> = el id de una fila 'waiting' en la tabla payments
//                 (créala pulsando "Pagar con cripto" en la web y cópiala de Supabase).

import crypto from 'crypto'

const orderId = process.argv[2]
const site = process.argv[3] || process.env.SITE_URL || 'https://caxandra.com'
const secret = process.env.NOWPAYMENTS_IPN_SECRET

if (!orderId || !secret) {
  console.error('Falta el id del pago o el IPN secret.')
  console.error('Uso: NOWPAYMENTS_IPN_SECRET=xxx node scripts/test-webhook.mjs <payments.id> [SITE_URL]')
  process.exit(1)
}

function sortObject(obj) {
  return Object.keys(obj).sort().reduce((acc, k) => {
    const v = obj[k]
    acc[k] = v && typeof v === 'object' && !Array.isArray(v) ? sortObject(v) : v
    return acc
  }, {})
}

const payload = {
  payment_id: 'test-' + Date.now(),
  invoice_id: 'test-invoice',
  payment_status: 'finished',
  order_id: orderId,
  price_amount: 1.99,
  price_currency: 'usd',
  pay_currency: 'usdttrc20',
}

const signature = crypto
  .createHmac('sha512', secret)
  .update(JSON.stringify(sortObject(payload)))
  .digest('hex')

const res = await fetch(`${site}/api/payments/webhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-nowpayments-sig': signature },
  body: JSON.stringify(payload),
})

console.log('HTTP', res.status)
console.log(await res.text())
