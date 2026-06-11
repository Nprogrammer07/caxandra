// Regla de negocio (pura) sobre qué paquete puede comprar un usuario,
// según el ritmo de su suscripción ACTIVA actual (o null si no tiene).

export type SubscribeDecision =
  | { allowed: true }
  | { allowed: false; reason: string }

export function canSubscribe(
  currentDailyRate: number | null,
  newDailyRate: number,
): SubscribeDecision {
  // Sin plan activo: puede comprar cualquiera (compra inicial o renovación).
  if (currentDailyRate === null) {
    return { allowed: true }
  }

  // Con plan activo: solo se permite subir a uno ESTRICTAMENTE mayor.
  // (el mismo o uno menor se bloquean)
  if (newDailyRate <= currentDailyRate) {
    return {
      allowed: false,
      reason: 'Ya tienes un plan activo igual o superior. Solo puedes mejorar a uno de mayor ritmo.',
    }
  }

  return { allowed: true }
}