import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/(auth)/actions'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sin sesión -> al login.
  if (!user) redirect('/login')

  // Con sesión pero NO admin -> a la home. (Doble verificación: servidor.)
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) redirect('/')

  return (
    <div className="panel">
      <header className="panel-head">
        <div className="panel-brand">
          <img src="/assets/logo.png" alt="Caxandra" width={34} height={34} />
          <span>Panel · CAX<b>ANDRA</b></span>
        </div>
        <nav className="panel-nav">
          <Link href="/panel">Pronósticos</Link>
          <Link href="/panel/personalizados">Personalizados</Link>
        </nav>
        <form action={signOut}>
          <button type="submit" className="panel-logout">Salir</button>
        </form>
      </header>
      <main className="panel-body">{children}</main>
    </div>
  )
}