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

  const { data: packages } = await supabase
    .from('packages')
    .select('id, slug, name, total_predictions, daily_rate, price_usd')
    .eq('active', true)
    .order('sort_order')

  return (
    <>
      <Background />
      <Nav user={user ? { email: user.email } : null} />
      <div className="wrap">
        <div className="layout">
          <div className="col-main">
            <Reveal><Hero /></Reveal>
            <Reveal><Videos /></Reveal>
            <Reveal><Modules /></Reveal>
          </div>
          <aside className="col-side" id="planes">
            <Reveal><PlansPanel packages={packages ?? []} /></Reveal>
          </aside>
        </div>
      </div>
      <Footer />
      <WhatsAppFab />
    </>
  )
}
