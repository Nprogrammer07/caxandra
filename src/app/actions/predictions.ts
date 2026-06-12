'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { selectPredictionsForUser, type DayPrediction } from '@/lib/predictions'
import { colombiaToday } from '@/lib/date'
import { sendEmail } from '@/lib/email'
import { dailyPredictionsEmail, subscriptionExpiredEmail } from '@/lib/email-templates'

const PDF_BUCKET = 'prediction-pdfs'

type SendResult =
  | { ok: false; error: string }
  | {
      ok: true
      date: string
      predictions: number
      usersNotified: number
      totalDeliveries: number
      expiredUsers: number
      emailsFailed: number
    }

export async function sendTodaysPredictions(matchDate?: string): Promise<SendResult> {
  // 1) SOLO el admin.
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

  // 2) Pronósticos del día (con título y la ruta de su PDF).
  const { data: predictions } = await admin
    .from('predictions')
    .select('id, position, title, pdf_path')
    .eq('match_date', date)
    .order('position')

  if (!predictions || predictions.length === 0) {
    return { ok: false, error: `No hay pronósticos publicados para ${date}.` }
  }
  const predIds = predictions.map((p) => p.id)
  const predMap = new Map(predictions.map((p) => [p.id, p]))

  // 3) Entregas ya hechas (idempotencia).
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

  // 4) Suscripciones activas + correos.
  const { data: subs } = await admin
    .from('subscriptions')
    .select('id, user_id, daily_rate, remaining_predictions')
    .eq('status', 'active')

  const userIds = [...new Set((subs ?? []).map((s) => s.user_id))]
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, email')
    .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'])
  const emailByUser = new Map((profiles ?? []).map((p) => [p.id, p.email]))

  let usersNotified = 0
  let totalDeliveries = 0
  let expiredUsers = 0
  let emailsFailed = 0

  for (const sub of subs ?? []) {
    const { toDeliver, newRemaining, expired } = selectPredictionsForUser({
      dailyRate: sub.daily_rate,
      remaining: sub.remaining_predictions,
      predictions: predictions as DayPrediction[],
      alreadyDelivered: deliveredByUser.get(sub.user_id) ?? [],
    })

    if (toDeliver.length === 0) continue

    const email = emailByUser.get(sub.user_id)
    if (!email) {
      emailsFailed += 1
      continue
    }

    // 5) Descargar de Storage los PDFs que le tocan y prepararlos como adjuntos.
    const attachments: { filename: string; content: string }[] = []
    const titles: { position: number; title: string }[] = []
    let pdfsOk = true

    for (const d of toDeliver) {
      const full = predMap.get(d.id)!
      titles.push({ position: full.position, title: full.title })

      if (!full.pdf_path) {
        pdfsOk = false
        break
      }
      const { data: file, error } = await admin.storage.from(PDF_BUCKET).download(full.pdf_path)
      if (error || !file) {
        pdfsOk = false
        break
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      attachments.push({
        filename: `pronostico-${full.position}.pdf`,
        content: buffer.toString('base64'),
      })
    }

    // Si falta algún PDF, NO enviamos incompleto ni cobramos: se reintenta luego.
    if (!pdfsOk) {
      emailsFailed += 1
      continue
    }

    const { subject, html } = dailyPredictionsEmail({ items: titles, date })

    // Enviar PRIMERO; solo si sale, registrar.
    const sent = await sendEmail({ to: email, subject, html, attachments })
    if (!sent.ok) {
      emailsFailed += 1
      continue
    }

    await admin
      .from('prediction_deliveries')
      .insert(toDeliver.map((d) => ({ prediction_id: d.id, user_id: sub.user_id })))

    await admin
      .from('subscriptions')
      .update({
        remaining_predictions: newRemaining,
        status: expired ? 'expired' : 'active',
        expired_at: expired ? new Date().toISOString() : null,
      })
      .eq('id', sub.id)

    usersNotified += 1
    totalDeliveries += toDeliver.length

    if (expired) {
      expiredUsers += 1
      const exp = subscriptionExpiredEmail()
      await sendEmail({ to: email, subject: exp.subject, html: exp.html })
    }
  }

  return {
    ok: true,
    date,
    predictions: predictions.length,
    usersNotified,
    totalDeliveries,
    expiredUsers,
    emailsFailed,
  }
}