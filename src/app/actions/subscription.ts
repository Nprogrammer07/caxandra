'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { canSubscribe } from '@/lib/subscription-rules'
import { createInvoice } from '@/lib/nowpayments'

export type BuyResult = { ok: true; url: string } | { ok: false; error: string }

export async function subscribeToPackage(slug: string): Promise<BuyResult> {
  // 1) Sesión obligatoria.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Debes iniciar sesión para comprar.' }

  const admin = createAdminClient()

  // 2) Traer el paquete.
  const { data: pkg } = await admin
    .from('packages')
    .select('id, name, daily_rate, price_usd, active')
    .eq('slug', slug)
    .single()
  if (!pkg || !pkg.active) return { ok: false, error: 'Plan no disponible.' }

  // 3) Regla de mejora: revisar la suscripción activa ANTES de cobrar.
  const { data: activeSub } = await admin
    .from('subscriptions')
    .select('daily_rate')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  const currentRate = activeSub ? activeSub.daily_rate : null
  if (!canSubscribe(currentRate, pkg.daily_rate)) {
    return { ok: false, error: 'Solo puedes mejorar tu plan, no bajarlo ni repetir el mismo.' }
  }

  // 4) Crear el pago PENDIENTE (la suscripción se crea en el webhook, al confirmarse).
  const { data: payment, error: payErr } = await admin
    .from('payments')
    .insert({ user_id: user.id, amount_usd: pkg.price_usd, status: 'waiting', package_id: pkg.id })
    .select('id')
    .single()
  if (payErr || !payment) return { ok: false, error: payErr?.message ?? 'No se pudo crear el pago.' }

  // 5) Crear la factura en NOWPayments y devolver la URL de pago.
  const site = process.env.NEXT_PUBLIC_SITE_URL
  const inv = await createInvoice({
    priceAmount: Number(pkg.price_usd),
    orderId: payment.id,
    orderDescription: `Caxandra · ${pkg.name}`,
    successUrl: `${site}/?pago=ok`,
    cancelUrl: `${site}/?pago=cancelado`,
  })
  if (!inv.ok) return { ok: false, error: inv.error }

  await admin.from('payments').update({ provider_payment_id: inv.invoiceId }).eq('id', payment.id)
  return { ok: true, url: inv.url }
}