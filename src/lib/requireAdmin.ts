import { createClient } from '@/utils/supabase/server'

// Lanza un error si quien llama no es un admin. Se usa al INICIO de cada
// server action sensible del panel, para no depender solo del guard de la página.
export async function requireAdmin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado.')

  // Lee el propio perfil (RLS permite leer tu fila); no causa recursión.
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('No autorizado.')
  return user
}