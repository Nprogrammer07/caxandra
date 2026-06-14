// Reglas de negocio PURAS (sin base de datos). Deciden qué hacer; la
// ejecución (hablar con Supabase) queda en las acciones y el webhook.

export type Validation = { ok: true } | { ok: false; error: string }

// --- Compra de servicios (análisis / seminario) ---

export type ServicePurchaseInput = {
  serviceSlug: string
  requestText: string
  oncePerUser: boolean
  alreadyOwned: boolean // ¿el usuario ya tiene una orden pagada/entregada de este servicio?
}

export function validateServicePurchase(input: ServicePurchaseInput): Validation {
  // El análisis necesita que el usuario diga qué partido analizar.
  if (input.serviceSlug === 'analisis' && !input.requestText.trim()) {
    return { ok: false, error: 'Escribe el partido que quieres que analicemos.' }
  }
  // Los servicios de una sola vez (seminario) no se pueden recomprar.
  if (input.oncePerUser && input.alreadyOwned) {
    return { ok: false, error: 'Ya adquiriste este servicio (es de una sola vez).' }
  }
  return { ok: true }
}

// --- Decisión del webhook: ¿activamos el acceso, y de qué tipo? ---

export type FulfillmentInput = {
  status: string
  alreadyFulfilled: boolean
  serviceOrderId: string | null
  packageId: string | null
}

export type Fulfillment =
  | { action: 'none'; reason: string }
  | { action: 'activate_service'; serviceOrderId: string }
  | { action: 'create_subscription'; packageId: string }

export function decideFulfillment(input: FulfillmentInput): Fulfillment {
  // Solo activamos con el pago totalmente confirmado.
  if (input.status !== 'finished') return { action: 'none', reason: 'not_finished' }
  // Idempotencia: si ya se activó, no repetir (evita doble suscripción).
  if (input.alreadyFulfilled) return { action: 'none', reason: 'already_fulfilled' }
  // Servicio o plan, según a qué esté enlazado el pago.
  if (input.serviceOrderId) return { action: 'activate_service', serviceOrderId: input.serviceOrderId }
  if (input.packageId) return { action: 'create_subscription', packageId: input.packageId }
  return { action: 'none', reason: 'nothing_to_do' }
}