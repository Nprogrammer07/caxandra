// Colombia es UTC-5 fijo (no tiene horario de verano), así que el cálculo
// es directo: corremos el instante 5 horas hacia atrás y leemos la fecha.

export function toColombiaDateString(date: Date): string {
  const shifted = new Date(date.getTime() - 5 * 60 * 60 * 1000)
  return shifted.toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

export function colombiaToday(): string {
  return toColombiaDateString(new Date())
}