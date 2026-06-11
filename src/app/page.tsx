import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { error } = await supabase.auth.getSession()

  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif', lineHeight: 1.8 }}>
      <h1>Caxandra — prueba de conexión</h1>
      <p>Variable de URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ cargada' : '❌ falta'}</p>
      <p>Conexión a Supabase: {error ? `❌ ${error.message}` : '✅ sin errores'}</p>
    </main>
  )
}
