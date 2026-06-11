'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { selectPredictionsForUser, type DayPrediction } from '@/lib/predictions'
import { colombiaToday } from '@/lib/date'

type SendResult =
  | { ok: false; error: string }
  | {
      ok: true
      date: string
      predictions: number     // cuántos pronósticos había hoy
      usersNotified: number    // a cuántos usuarios se les envió algo
      totalDeliveries: number  // total de entregas registradas
      expiredUsers: number     // cuántos quedaron sin saldo (vencidos)
    }

export async function sendTodaysPredictions(matchDate?: string): Promise<SendResult> {
  // 1) SOLO el admin puede disparar el envío.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return { ok: false, error: 'Solo el administrador puede enviar.' }

  const date = matchDate ?? colombiaToday()
  const admin = createAdminClient()

  // 2) Pronósticos del día.
  const { data: predictions } = await admin
    .from('predictions')
    .select('id, position')
    .eq('match_date', date)
    .order('position')

  if (!predictions || predictions.length === 0) {
    return { ok: false, error: `No hay pronósticos publicados para ${date}.` }
  }
  const predIds = predictions.map((p) => p.id)

  // 3) Entregas ya hechas de ESTE set (para no repetir si se corre dos veces).
  const { data: existing } = await admin
    .from('prediction_deliveries')
    .select('user_id, prediction_id')
    .in('prediction_id', predIds)

  const deliveredByUser = new Map<string, string[]>()
  for (const row of existing ?? []) {
    const list = deliveredByUser.get(row.user_id) ?? []
    list.push(row.prediction_id)
    deliveredByUser.set(row.user_id, list)
  }

  // 4) Suscripciones activas.
  const { data: subs } = await admin
    .from('subscriptions')
    .select('id, user_id, daily_rate, remaining_predictions')
    .eq('status', 'active')

  const newDeliveries: { prediction_id: string; user_id: string }[] = []
  const subUpdates: { id: string; remaining: number; expired: boolean }[] = []
  let usersNotified = 0
  let totalDeliveries = 0
  let expiredUsers = 0

  // 5) Por cada suscripción, decidir qué recibe (LÓGICA PURA YA TESTEADA).
  for (const sub of subs ?? []) {
    const { toDeliver, newRemaining, expired } = selectPredictionsForUser({
      dailyRate: sub.daily_rate,
      remaining: sub.remaining_predictions,
      predictions: predictions as DayPrediction[],
      alreadyDelivered: deliveredByUser.get(sub.user_id) ?? [],
    })

    if (toDeliver.length === 0) continue

    for (const p of toDeliver) {
      newDeliveries.push({ prediction_id: p.id, user_id: sub.user_id })
    }
    subUpdates.push({ id: sub.id, remaining: newRemaining, expired })
    usersNotified += 1
    totalDeliveries += toDeliver.length
    if (expired) expiredUsers += 1
  }

  // 6) Registrar entregas PRIMERO (la restricción única evita duplicados).
  if (newDeliveries.length > 0) {
    const { error } = await admin.from('prediction_deliveries').insert(newDeliveries)
    if (error) return { ok: false, error: 'Error al registrar entregas: ' + error.message }
  }

  // 7) Luego descontar saldo y marcar vencidas.
  for (const u of subUpdates) {
    await admin
      .from('subscriptions')
      .update({
        remaining_predictions: u.remaining,
        status: u.expired ? 'expired' : 'active',
        expired_at: u.expired ? new Date().toISOString() : null,
      })
      .eq('id', u.id)
  }

  // (En la Fase 6 aquí se enviarán los correos reales a usersNotified.)
  return {
    ok: true,
    date,
    predictions: predictions.length,
    usersNotified,
    totalDeliveries,
    expiredUsers,
  }
}