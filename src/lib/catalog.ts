import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

export type CatalogPackage = {
  id: string
  slug: string
  name: string
  total_predictions: number
  daily_rate: number
  price_usd: number
}
export type CatalogService = { slug: string; name: string; price_usd: number }

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}

// Datos públicos del landing (planes, servicios y el video semanal),
// cacheados juntos. Se refrescan cada hora O cuando el admin cambia algo
// (revalidateTag('catalog') desde las acciones del panel).
export const getCatalog = unstable_cache(
  async (): Promise<{
    packages: CatalogPackage[]
    services: CatalogService[]
    weeklyVideoId: string | null
  }> => {
    const supabase = publicClient()
    const [pkgRes, svcRes, vidRes] = await Promise.all([
      supabase
        .from('packages')
        .select('id, slug, name, total_predictions, daily_rate, price_usd')
        .eq('active', true)
        .order('sort_order'),
      supabase.from('services').select('slug, name, price_usd').eq('active', true),
      supabase.from('site_settings').select('value').eq('key', 'weekly_video').maybeSingle(),
    ])
    return {
      packages: pkgRes.data ?? [],
      services: svcRes.data ?? [],
      weeklyVideoId: vidRes.data?.value ?? null,
    }
  },
  ['catalog'],
  { revalidate: 3600, tags: ['catalog'] },
)