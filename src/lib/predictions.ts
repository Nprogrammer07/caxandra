// Motor de selección de pronósticos (lógica pura, sin base de datos).
// Dado el set del día y la suscripción de UN usuario, decide qué recibe hoy.

export type DayPrediction = {
  id: string
  position: number // posición dentro del set del día: 1..8
}

export type SelectionInput = {
  dailyRate: number             // ritmo del plan del usuario: 1, 3 u 8
  remaining: number             // saldo de pronósticos que le quedan
  predictions: DayPrediction[]  // los pronósticos publicados hoy (posiciones 1..8)
  alreadyDelivered?: string[]   // ids ya enviados a este usuario (para no repetir)
}

export type SelectionResult = {
  toDeliver: DayPrediction[]    // lo que se le envía hoy
  newRemaining: number          // saldo tras el envío
  expired: boolean              // true si el saldo llegó a 0
}

export function selectPredictionsForUser(input: SelectionInput): SelectionResult {
  const { dailyRate, remaining, predictions } = input
  const alreadyDelivered = input.alreadyDelivered ?? []

  // Sin saldo no se entrega nada: ya está vencida.
  if (remaining <= 0) {
    return { toDeliver: [], newRemaining: 0, expired: true }
  }

  // 1) Elegibles: dentro del ritmo del plan (posición <= ritmo) y aún no enviados.
  const eligible = predictions
    .filter((p) => p.position <= dailyRate && !alreadyDelivered.includes(p.id))
    .sort((a, b) => a.position - b.position)

  // 2) Nunca entregar más de lo que le queda de saldo.
  const toDeliver = eligible.slice(0, remaining)

  const newRemaining = remaining - toDeliver.length
  return { toDeliver, newRemaining, expired: newRemaining <= 0 }
}