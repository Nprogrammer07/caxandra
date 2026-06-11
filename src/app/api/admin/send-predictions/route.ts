import { NextResponse } from 'next/server'
import { sendTodaysPredictions } from '@/app/actions/predictions'

// TEMPORAL: dispara el envío manualmente mientras construimos la página de
// superadmin (Fase 7). La acción interna ya valida que seas admin, así que
// un usuario normal no puede usarla. Se puede borrar cuando exista el botón.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') ?? undefined
  const result = await sendTodaysPredictions(date)
  return NextResponse.json(result)
}