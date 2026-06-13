import { createClient } from '@/utils/supabase/server'
import Background from '@/components/landing/Background'
import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import Videos from '@/components/landing/Videos'
import Modules from '@/components/landing/Modules'
import PlansPanel from '@/components/landing/PlansPanel'
import Footer from '@/components/landing/Footer'
import WhatsAppFab from '@/components/landing/WhatsAppFab'
import Reveal from '@/components/landing/Reveal'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let predictionsLeft: number | null = null
  let isAdmin = false
  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('remaining_predictions')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    predictionsLeft = sub?.remaining_predictions ?? null
  }

  const { data: services } = await supabase
    .from('services')
    .select('slug, name, price_usd')
    .eq('active', true)

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.is_admin ?? false
  }

  const { data: packages } = await supabase
    .from('packages')
    .select('id, slug, name, total_predictions, daily_rate, price_usd')
    .eq('active', true)
    .order('sort_order')

  return (
    <>
      <Background />
      <Nav 
        user={user ? { email: user.email } : null} 
        predictionsLeft={predictionsLeft}
        isAdmin={isAdmin}
      />
      <div className="wrap">
        <div className="layout">
          <div className="col-main">
            <Reveal><Hero /></Reveal>
            <Reveal><Videos /></Reveal>
            <Reveal><Modules isLoggedIn={!!user} services={services ?? []} /></Reveal>
          </div>
          <aside className="col-side" id="planes">
            <Reveal><PlansPanel isLoggedIn={!!user} /></Reveal>
          </aside>
        </div>
      </div>
      <Footer />
      <WhatsAppFab />
    </>
  )
}
