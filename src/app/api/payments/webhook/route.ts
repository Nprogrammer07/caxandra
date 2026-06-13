import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { verifyIpnSignature } from '@/lib/nowpayments'

// crypto necesita el runtime de Node, y el webhook nunca se cachea.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'IPN secret no configurado' }, { status: 500 })
  }

  // 1) Leer el cuerpo CRUDO y la firma del encabezado.
  const raw = await req.text()
  const signature = req.headers.get('x-nowpayments-sig')

  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // 2) Verificar la firma. Si no coincide, el webhook es FALSO -> rechazar.
  if (!verifyIpnSignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  const orderId = String(body.order_id ?? '') // = nuestro payments.id
  const status = String(body.payment_status ?? '')
  const payCurrency = body.pay_currency ? String(body.pay_currency) : null
  if (!orderId) return NextResponse.json({ error: 'Sin order_id' }, { status: 400 })

  const admin = createAdminClient()

  // 3) Localizar el pago que creamos al iniciar la compra.
  const { data: payment } = await admin
    .from('payments')
    .select('id, fulfilled, package_id, service_order_id, user_id')
    .eq('id', orderId)
    .maybeSingle()
  if (!payment) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })

  // 4) Registrar el estado y el webhook íntegro (auditoría).
  await admin
    .from('payments')
    .update({
      status,
      pay_currency: payCurrency,
      raw_webhook: body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id)

  // 5) Activar SOLO si el pago está 'finished' y aún no se activó (idempotente).
  if (status === 'finished' && !payment.fulfilled) {
    if (payment.service_order_id) {
      // Servicio (análisis/seminario): la orden pasa a 'paid' y aparece en el panel.
      await admin
        .from('service_orders')
        .update({ status: 'paid' })
        .eq('id', payment.service_order_id)
    } else if (payment.package_id) {
      // Plan: crear la suscripción (la mejora reemplaza la anterior).
      const { data: pkg } = await admin
        .from('packages')
        .select('daily_rate, total_predictions')
        .eq('id', payment.package_id)
        .single()
      if (pkg) {
        await admin
          .from('subscriptions')
          .update({ status: 'expired', expired_at: new Date().toISOString() })
          .eq('user_id', payment.user_id)
          .eq('status', 'active')

        await admin.from('subscriptions').insert({
          user_id: payment.user_id,
          package_id: payment.package_id,
          daily_rate: pkg.daily_rate,
          total_predictions: pkg.total_predictions,
          remaining_predictions: pkg.total_predictions,
          status: 'active',
        })
      }
    }

    // Marcar el pago como cumplido para no activar dos veces.
    await admin.from('payments').update({ fulfilled: true }).eq('id', payment.id)
  }

  // 6) Responder 200 para que NOWPayments no reintente.
  return NextResponse.json({ ok: true })
}