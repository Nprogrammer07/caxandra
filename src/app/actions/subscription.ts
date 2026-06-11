'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

type Result = { ok: true } | { ok: false; error: string }

export async function subscribeToPackage(packageId: string): Promise<Result> {
  // 1) ¿Quién es? (esto SÍ respeta la sesión real del usuario)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Debes iniciar sesión.' }

  // 2) Traer el paquete que quiere (con el cliente normal; es lectura pública)
  const { data: pkg } = await supabase
    .from('packages')
    .select('id, daily_rate, total_predictions')
    .eq('id', packageId)
    .single()
  if (!pkg) return { ok: false, error: 'Paquete no encontrado.' }

  // 3) A partir de aquí, ESCRITURA con el cliente admin (se salta RLS)
  const admin = createAdminClient()

  // Regla "solo se puede mejorar": si tiene una activa con ritmo mayor, no degradar.
  const { data: current } = await admin
    .from('subscriptions')
    .select('id, daily_rate')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (current && pkg.daily_rate < current.daily_rate) {
    return { ok: false, error: 'Solo puedes mejorar tu plan, no bajarlo.' }
  }

  // La mejora REEMPLAZA: vencemos la activa anterior (sin sumar saldo).
  if (current) {
    await admin
      .from('subscriptions')
      .update({ status: 'expired', expired_at: new Date().toISOString() })
      .eq('id', current.id)
  }

  // 4) Crear la nueva suscripción con el saldo completo.
  const { error } = await admin.from('subscriptions').insert({
    user_id: user.id,
    package_id: pkg.id,
    daily_rate: pkg.daily_rate,
    total_predictions: pkg.total_predictions,
    remaining_predictions: pkg.total_predictions,
    status: 'active',
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  return { ok: true }
}