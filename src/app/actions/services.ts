'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export type PurchaseResult = { ok: true } | { ok: false; error: string }

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

  // 2) Traer el servicio del catálogo.
  const admin = createAdminClient()
  const { data: service } = await admin
    .from('services')
    .select('id, slug, once_per_user, active')
    .eq('slug', slug)
    .single()

  if (!service || !service.active) return { ok: false, error: 'Servicio no disponible.' }

  // 3) El análisis necesita el partido.
  if (service.slug === 'analisis' && !requestText) {
    return { ok: false, error: 'Escribe el partido que quieres que analicemos.' }
  }

  // 4) Servicios de una sola vez (seminario): bloquear si ya lo tiene.
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

  // 5) PAGO SIMULADO: creamos la orden ya pagada. En la Mitad B, NOWPayments
  //    confirmará el pago por webhook y solo entonces la orden pasará a 'paid'.
  const { error } = await admin.from('service_orders').insert({
    user_id: user.id,
    service_id: service.id,
    request_text: service.slug === 'analisis' ? requestText : null,
    status: 'paid',
  })
  if (error) return { ok: false, error: error.message }

  return { ok: true }
}