import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendEmail } from '@/lib/email'

// TEMPORAL: envía un correo de prueba a TU PROPIO email (el de tu sesión).
// En modo de pruebas de Resend, solo llega si ese email es el mismo con el
// que te registraste en Resend.
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ ok: false, error: 'No autenticado.' })
  }

  const result = await sendEmail({
    to: user.email,
    subject: 'Prueba de Caxandra ✅',
    html: `
      <div style="font-family:sans-serif;background:#04080a;color:#f4f7f3;padding:32px;border-radius:12px">
        <h1 style="color:#b8ff20;margin:0 0 12px">Caxandra</h1>
        <p>Tu integración de correo con Resend funciona. 🎉</p>
        <p style="color:#8c958b;font-size:13px">Este es un correo de prueba.</p>
      </div>
    `,
  })

  return NextResponse.json(result)
}