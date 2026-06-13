import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Dirección de PRUEBAS de Resend. Cámbiala por tu dominio verificado luego.
const FROM = 'Caxandra <pronosticos@caxandra.com>'

// Adjuntos: el contenido va en Base64.
type Attachment = { filename: string; content: string }

type SendResult = { ok: true; id?: string } | { ok: false; error: string }

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string
  subject: string
  html: string
  attachments?: Attachment[]
}): Promise<SendResult> {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    attachments,
  })

  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true, id: data?.id }
}