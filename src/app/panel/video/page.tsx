import { requireAdmin } from '@/lib/requireAdmin'
import { createAdminClient } from '@/utils/supabase/admin'
import WeeklyVideoForm from './WeeklyVideoForm'

export default async function VideoPage() {
  await requireAdmin()

  const admin = createAdminClient()
  const { data } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', 'weekly_video')
    .maybeSingle()

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontFamily: 'var(--font-d)', marginBottom: 8 }}>Video semanal</h2>
      <p style={{ color: 'var(--gray)', fontSize: '.92rem', marginBottom: 18 }}>
        Pega el enlace (o el ID) del video de YouTube que se mostrará esta semana en la página.
        El cambio se ve de inmediato; no hace falta nada más.
      </p>
      <WeeklyVideoForm current={data?.value ?? ''} />
    </div>
  )
}