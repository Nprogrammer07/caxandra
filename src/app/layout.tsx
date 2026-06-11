import type { Metadata } from 'next'
import { Chakra_Petch, Inter } from 'next/font/google'
import './globals.css'

const chakra = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-chakra',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Caxandra · Predicciones Deportivas Profesionales',
  description: 'Análisis avanzados, estadísticas y predicciones premium para fanáticos del fútbol.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${chakra.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}