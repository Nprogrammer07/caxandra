import { createClient } from '@supabase/supabase-js'

// Cliente con permisos totales (se salta RLS). SOLO para usar en el servidor.
// Nunca lo importes en un componente con 'use client'.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}