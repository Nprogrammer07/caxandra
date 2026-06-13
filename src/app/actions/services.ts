'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createInvoice } from '@/lib/nowpayments'

export type PurchaseResult = { ok: true; url: string } | { ok: false; error: string }

export async function purchaseService(
  _prev: unknown,
  formData: FormData,
): Promise<PurchaseResult> {
  const slug = String(formData.get('slug') ?? '')
  const requestText = String(formData.get('requestText') ?? '').trim()

  // 1) Sesión obligatoria.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Debes iniciar sesión para comprar.' }

  // 2) Traer el servicio.
  const admin = createAdminClient()
  const { data: service } = await admin
    .from('services')
    .select('id, slug, name, price_usd, once_per_user, active')
    .eq('slug', slug)
    .single()
  if (!service || !service.active) return { ok: false, error: 'Servicio no disponible.' }

  // 3) El análisis necesita el partido.
  if (service.slug === 'analisis' && !requestText) {
    return { ok: false, error: 'Escribe el partido que quieres que analicemos.' }
  }

  // 4) Servicios de una sola vez (seminario): bloquear si ya lo pagó.
  if (service.once_per_user) {
    const { data: existing } = await admin
      .from('service_orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('service_id', service.id)
      .in('status', ['paid', 'delivered'])
      .maybeSingle()
    if (existing) return { ok: false, error: 'Ya adquiriste este servicio (es de una sola vez).' }
  }

  // 5) Orden PENDIENTE de pago (ya no 'paid'; pasa a 'paid' en el webhook).
  const { data: order, error: orderErr } = await admin
    .from('service_orders')
    .insert({
      user_id: user.id,
      service_id: service.id,
      request_text: service.slug === 'analisis' ? requestText : null,
      status: 'pending_payment',
    })
    .select('id')
    .single()
  if (orderErr || !order) return { ok: false, error: orderErr?.message ?? 'No se pudo crear la orden.' }

  // 6) Pago pendiente enlazado a la orden.
  const { data: payment, error: payErr } = await admin
    .from('payments')
    .insert({ user_id: user.id, amount_usd: service.price_usd, status: 'waiting', service_order_id: order.id })
    .select('id')
    .single()
  if (payErr || !payment) return { ok: false, error: payErr?.message ?? 'No se pudo crear el pago.' }

  // 7) Factura NOWPayments.
  const site = process.env.NEXT_PUBLIC_SITE_URL
  const inv = await createInvoice({
    priceAmount: Number(service.price_usd),
    orderId: payment.id,
    orderDescription: `Caxandra · ${service.name}`,
    successUrl: `${site}/?pago=ok`,
    cancelUrl: `${site}/?pago=cancelado`,
  })
  if (!inv.ok) return { ok: false, error: inv.error }

  await admin.from('payments').update({ provider_payment_id: inv.invoiceId }).eq('id', payment.id)
  return { ok: true, url: inv.url }
}