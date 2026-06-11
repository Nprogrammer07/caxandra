import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { signOut } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  // getUser() verifica el token contra el servidor de Supabase (más seguro que getSession).
  const { data: { user } } = await supabase.auth.getUser()

  // Si no hay sesión, fuera: al login.
  if (!user) redirect('/login')

  return (
    <div className="wrap" style={{ paddingTop: 60 }}>
      <h1 className="sec-title">Tu panel</h1>
      <p className="sec-sub">
        Sesión iniciada como <b style={{ color: 'var(--neon)' }}>{user.email}</b>.
      </p>
      <form action={signOut} style={{ marginTop: 24 }}>
        <button type="submit" className="btn btn-ghost">Cerrar sesión</button>
      </form>
    </div>
  )
}