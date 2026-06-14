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

// Cliente SIN cookies: el catálogo es público (RLS de lectura pública),
// no necesita la sesión del usuario. Esto permite cachearlo.
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}

// getCatalog se ejecuta una vez y su resultado se reutiliza durante 1 hora,
// en vez de consultar Supabase en CADA carga de la home.
export const getCatalog = unstable_cache(
  async (): Promise<{ packages: CatalogPackage[]; services: CatalogService[] }> => {
    const supabase = publicClient()
    const [pkgRes, svcRes] = await Promise.all([
      supabase
        .from('packages')
        .select('id, slug, name, total_predictions, daily_rate, price_usd')
        .eq('active', true)
        .order('sort_order'),
      supabase
        .from('services')
        .select('slug, name, price_usd')
        .eq('active', true),
    ])
    return {
      packages: pkgRes.data ?? [],
      services: svcRes.data ?? [],
    }
  },
  ['catalog'],                              // clave del caché
  { revalidate: 3600, tags: ['catalog'] },  // se refresca cada hora
)