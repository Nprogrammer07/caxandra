'use server'

import { requireAdmin } from '@/lib/requireAdmin'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { colombiaToday } from '@/lib/date'
import { sendTodaysPredictions } from '@/app/actions/predictions'
import { sendEmail } from '@/lib/email'
import { serviceDeliveryEmail } from '@/lib/email-templates'

const PDF_BUCKET = 'prediction-pdfs'
const SERVICE_BUCKET = 'service-pdfs'

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  return profile?.is_admin ?? false
}

// ---- Pronósticos del día ----

export async function savePrediction(formData: FormData): Promise<void> {
  await requireAdmin()
  if (!(await isAdmin())) return

  const position = Number(formData.get('position'))
  const title = String(formData.get('title') ?? '').trim()
  const file = formData.get('pdf') as File | null
  if (!position || !title) return

  const date = colombiaToday()
  const admin = createAdminClient()

  let pdfPath: string | undefined
  if (file && file.size > 0) {
    const path = `${date}/pos-${position}.pdf`
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error } = await admin.storage
      .from(PDF_BUCKET)
      .upload(path, buffer, { contentType: 'application/pdf', upsert: true })
    if (!error) pdfPath = path
  }

  const row: Record<string, unknown> = { match_date: date, position, title }
  if (pdfPath) row.pdf_path = pdfPath

  await admin.from('predictions').upsert(row, { onConflict: 'match_date,position' })
  revalidatePath('/panel')
}

export async function sendToday(_prev: unknown, _formData: FormData) {
  await requireAdmin()
  return await sendTodaysPredictions()
}

// ---- Personalizados (análisis y seminario) ----

export type DeliverResult = { ok: true } | { ok: false; error: string }

export async function deliverServiceOrder(
  _prev: unknown,
  formData: FormData,
): Promise<DeliverResult> {
  await requireAdmin()
  if (!(await isAdmin())) return { ok: false, error: 'No autorizado.' }

  const orderId = String(formData.get('orderId') ?? '')
  const message = String(formData.get('message') ?? '').trim()
  const file = formData.get('pdf') as File | null
  if (!orderId) return { ok: false, error: 'Falta la orden.' }
  if (!file || file.size === 0) return { ok: false, error: 'Debes adjuntar un PDF.' }

  const admin = createAdminClient()

  const { data: order } = await admin
    .from('service_orders')
    .select('id, status, request_text, profiles(email), services(name)')
    .eq('id', orderId)
    .single()

  if (!order) return { ok: false, error: 'No se encontró la orden.' }
  if (order.status !== 'paid') return { ok: false, error: 'Esta orden ya fue atendida.' }

  const email = (order as { profiles?: { email?: string } }).profiles?.email
  const serviceName = (order as { services?: { name?: string } }).services?.name
  if (!email) return { ok: false, error: 'La orden no tiene correo asociado.' }

  // Subir el PDF.
  const path = `services/${orderId}.pdf`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: upErr } = await admin.storage
    .from(SERVICE_BUCKET)
    .upload(path, buffer, { contentType: 'application/pdf', upsert: true })
  if (upErr) return { ok: false, error: 'No se pudo subir el PDF: ' + upErr.message }

  // Enviar el correo.
  const { subject, html } = serviceDeliveryEmail({
    serviceName: serviceName ?? 'Servicio',
    requestText: order.request_text ?? undefined,
    message: message || undefined,
  })
  const sent = await sendEmail({
    to: email,
    subject,
    html,
    attachments: [{ filename: 'contenido.pdf', content: buffer.toString('base64') }],
  })
  if (!sent.ok) return { ok: false, error: 'No se pudo enviar el correo: ' + sent.error }

  // Marcar entregada.
  await admin
    .from('service_orders')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      delivered_content: path,
    })
    .eq('id', orderId)

  revalidatePath('/panel/personalizados')
  return { ok: true }
}