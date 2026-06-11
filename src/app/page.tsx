import Background from '@/components/landing/Background'
import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import Videos from '@/components/landing/Videos'
import Modules from '@/components/landing/Modules'
import PlansPanel from '@/components/landing/PlansPanel'
import Footer from '@/components/landing/Footer'
import WhatsAppFab from '@/components/landing/WhatsAppFab'
import Reveal from '@/components/landing/Reveal'

export default function Home() {
  return (
    <>
      <Background />
      <Nav />
      <div className="wrap">
        <div className="layout">
          <div className="col-main">
            <Reveal><Hero /></Reveal>
            <Reveal><Videos /></Reveal>
            <Reveal><Modules /></Reveal>
          </div>
          <aside className="col-side" id="planes">
            <Reveal><PlansPanel /></Reveal>
          </aside>
        </div>
      </div>
      <Footer />
      <WhatsAppFab />
    </>
  )
}
