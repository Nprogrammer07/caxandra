'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// El tipo del "resultado" que la acción devuelve al formulario.
// Ambos campos son opcionales: o hay error, o hay mensaje de éxito, o nada (redirige).
export type AuthState = { error?: string; success?: string }

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // No revelamos si falló el correo o la contraseña (buena práctica de seguridad).
    return { error: 'Correo o contraseña incorrectos.' }
  }

  // Refresca los datos de sesión en toda la app y manda al panel.
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Si la confirmación por correo está DESACTIVADA, signUp ya devuelve una sesión:
  // el usuario queda logueado y lo mandamos al panel.
  if (data.session) {
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }

  // Si está ACTIVADA, no hay sesión todavía: debe confirmar desde el correo.
  return { success: 'Te enviamos un correo. Confírmalo para activar tu cuenta.' }
}