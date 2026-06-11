import { WA_LINK } from '@/lib/whatsapp'

export default function Footer() {
  return (
    <footer>
      <div className="wrap foot-in">
        <div className="brand">
          <img className="mark" src="/assets/logo.png" alt="Caxandra" width={70} height={70} />
          <div className="txt">CAX<b>ANDRA</b></div>
        </div>
        <div className="foot-note">© 2026 Caxandra · Predicciones deportivas profesionales</div>
        <a className="foot-wa" href={WA_LINK} target="_blank" rel="noopener noreferrer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
            <path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.7-1.2-4.5-4-4.6-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.4 0 .5-.1.2-.2.3-.3.5-.2.2-.3.4-.5.5-.2.2-.3.3-.1.6.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.4 2.6 1.6.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.3.1 1.6.8 1.9.9.3.2.5.2.5.3.1.2.1.7-.1 1.3z" />
          </svg>
          Contáctanos por WhatsApp
        </a>
      </div>
    </footer>
  )
}