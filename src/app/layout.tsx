import type { Metadata, Viewport } from 'next'
import { Ubuntu } from 'next/font/google'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/site/footer'
import { SiteHeader } from '@/components/site/header'
import { SITE_NAME, SITE_URL } from '@/lib/routes'

import './globals.css'

/**
 * Ubuntu, the prototype's typeface.
 *
 * next/font self-hosts the files and preloads them, so there is no request to
 * fonts.googleapis.com and no render-blocking stylesheet. `adjustFontFallback`
 * is on by default and generates a metric-matched local fallback, which is what
 * removes the layout shift the prototype's <link> version causes while the font
 * is still downloading. That matters here: the target is green Core Web Vitals
 * on a midrange Android over 4G.
 */
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  style: ['normal'],
  display: 'swap',
  variable: '--py-font-ubuntu',
})

/**
 * Italic is used in exactly one place, the emphasised word in the hero
 * headline, so only the 700 italic face is loaded. This matches the font
 * request the prototype makes (ital,wght@0,300;0,400;0,500;0,700;1,700) and
 * keeps four unused italic weights off the wire.
 */
const ubuntuItalic = Ubuntu({
  subsets: ['latin'],
  weight: ['700'],
  style: ['italic'],
  display: 'swap',
  variable: '--py-font-ubuntu-italic',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Goedkoop en centraal parkeren`,
    template: `%s`,
  },
  description:
    'Parkeer goedkoop en centraal in Eindhoven, Rotterdam, Amsterdam en elf andere steden. Reserveer online en rij in met kentekenherkenning.',
  applicationName: SITE_NAME,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#374e9d',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl-NL" className={`${ubuntu.variable} ${ubuntuItalic.variable}`}>
      <body>
        <a href="#inhoud" className="py-skip-link">
          Naar de inhoud
        </a>
        <SiteHeader />
        <main id="inhoud">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
