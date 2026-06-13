import crypto from 'crypto'

const API_BASE = 'https://api.nowpayments.io/v1'

type CreateInvoiceInput = {
  priceAmount: number
  orderId: string          // nuestro id interno de pago (para correlacionar el webhook)
  orderDescription: string
  successUrl: string
  cancelUrl: string
}

type CreateInvoiceResult =
  | { ok: true; url: string; invoiceId: string }
  | { ok: false; error: string }

// Crea una factura en NOWPayments y devuelve la URL a la que redirigir al usuario.
export async function createInvoice(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY
  const site = process.env.NEXT_PUBLIC_SITE_URL
  if (!apiKey) return { ok: false, error: 'Falta NOWPAYMENTS_API_KEY.' }
  if (!site) return { ok: false, error: 'Falta NEXT_PUBLIC_SITE_URL.' }

  const res = await fetch(`${API_BASE}/invoice`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: input.priceAmount,
      price_currency: 'usd',
      order_id: input.orderId,
      order_description: input.orderDescription,
      ipn_callback_url: `${site}/api/payments/webhook`,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    return { ok: false, error: `NOWPayments ${res.status}: ${text}` }
  }

  const data = (await res.json()) as { id: number | string; invoice_url: string }
  return { ok: true, url: data.invoice_url, invoiceId: String(data.id) }
}

// Ordena un objeto por claves (recursivo), igual que la referencia de NOWPayments.
function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce((acc: Record<string, unknown>, key) => {
      const val = obj[key]
      acc[key] =
        val && typeof val === 'object' && !Array.isArray(val)
          ? sortObject(val as Record<string, unknown>)
          : val
      return acc
    }, {})
}

// Verifica que el webhook venga DE VERDAD de NOWPayments (lógica pura, testeable).
export function verifyIpnSignature(
  params: Record<string, unknown>,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret) return false
  const expected = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(sortObject(params)))
    .digest('hex')
  try {
    // comparación en tiempo constante (evita ataques de temporización)
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}