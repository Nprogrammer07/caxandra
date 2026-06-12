type PredictionTitle = { position: number; title: string }

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function shell(inner: string): string {
  return `
  <div style="background:#04080a;padding:24px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#0b120d;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden">
      <div style="padding:24px 28px;border-bottom:1px solid rgba(255,255,255,0.08)">
        <span style="font-size:22px;font-weight:bold;letter-spacing:3px;color:#f4f7f3">CAX<span style="color:#b8ff20">ANDRA</span></span>
        <div style="font-size:9px;letter-spacing:3px;color:#8c958b;margin-top:4px">DATOS · ANÁLISIS · PREDICCIÓN · <span style="color:#b8ff20">GANANCIA</span></div>
      </div>
      <div style="padding:28px">${inner}</div>
      <div style="padding:18px 28px;border-top:1px solid rgba(255,255,255,0.08);color:#5c655c;font-size:11px">
        Recibes este correo porque tienes una suscripción activa en Caxandra.
      </div>
    </div>
  </div>`
}

// Correo corto: mensaje + lista de títulos. Los PDFs van como ADJUNTOS (en la acción).
export function dailyPredictionsEmail({
  items,
  date,
}: {
  items: PredictionTitle[]
  date: string
}): { subject: string; html: string } {
  const list = items
    .map(
      (p) => `
      <div style="border:1px solid rgba(184,255,32,0.25);border-radius:10px;padding:12px 14px;margin-bottom:10px;background:rgba(184,255,32,0.04)">
        <span style="font-size:11px;color:#b8ff20;letter-spacing:1px">PRONÓSTICO ${p.position}</span>
        <div style="font-size:15px;color:#f4f7f3;margin-top:4px">${escapeHtml(p.title)}</div>
      </div>`,
    )
    .join('')

  const inner = `
    <h1 style="font-size:20px;color:#f4f7f3;margin:0 0 6px">¡Aquí están tus pronósticos de hoy!</h1>
    <p style="color:#8c958b;font-size:13px;margin:0 0 18px">Te adjuntamos ${items.length} PDF(s) · ${date}. ¡A ganar! ⚡</p>
    ${list}
    <p style="color:#5c655c;font-size:12px;margin-top:18px">Cada pronóstico va en su PDF adjunto. Los pronósticos son análisis informativos, no garantías. Juega con responsabilidad.</p>`

  return {
    subject: `Tus pronósticos de hoy (${items.length}) · Caxandra`,
    html: shell(inner),
  }
}

export function subscriptionExpiredEmail(): { subject: string; html: string } {
  const inner = `
    <h1 style="font-size:20px;color:#f4f7f3;margin:0 0 10px">Tu suscripción se agotó</h1>
    <p style="color:#c8d0c8;font-size:14px;line-height:1.6">Has recibido todos los pronósticos de tu paquete. ¡Gracias por confiar en Caxandra!</p>
    <p style="color:#c8d0c8;font-size:14px;line-height:1.6">Para seguir recibiendo pronósticos diarios, renueva tu plan cuando quieras.</p>
    <a href="https://caxandra.com" style="display:inline-block;margin-top:14px;background:#b8ff20;color:#06160a;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">Renovar mi plan</a>`

  return {
    subject: 'Tu suscripción de Caxandra se agotó',
    html: shell(inner),
  }
}