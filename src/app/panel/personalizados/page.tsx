import { createAdminClient } from '@/utils/supabase/admin'
import OrderDeliveryForm from '@/components/panel/OrderDeliveryForm'

type Order = {
  id: string
  request_text: string | null
  created_at: string
  profiles: { email: string } | null
  services: { name: string; slug: string } | null
}

export default async function Personalizados() {
  const admin = createAdminClient()

  const { data } = await admin
    .from('service_orders')
    .select('id, request_text, created_at, profiles(email), services(name, slug)')
    .eq('status', 'paid')
    .order('created_at', { ascending: true })

  const orders = (data ?? []) as unknown as Order[]

  return (
    <div>
      <h1 className="panel-title">Personalizados</h1>
      <p className="panel-sub">
        Peticiones pagadas de análisis y seminario. Adjunta el contenido y se marcan como entregadas.
      </p>

      {orders.length === 0 ? (
        <div className="orders-empty">No hay peticiones pendientes. 🎉</div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-info">
                <span className="order-type">{o.services?.name ?? 'Servicio'}</span>
                <div className="order-email">{o.profiles?.email}</div>
                {o.request_text && (
                  <div className="order-req">
                    Partido solicitado: <b>{o.request_text}</b>
                  </div>
                )}
                <div className="order-date">{new Date(o.created_at).toLocaleString('es-CO')}</div>
              </div>

              <OrderDeliveryForm orderId={o.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}