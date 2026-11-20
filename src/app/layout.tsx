import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/site/footer'
import { SiteHeader } from '@/components/site/header'
import { SITE_NAME, SITE_URL } from '@/lib/routes'

import './globals.css'

/**
 * Ubuntu, the brand typeface.
 *
 * Loaded from the brand repository's own licensed copies (src/fonts/, Ubuntu
 * Font Licence 1.0) rather than next/font/google. Both self-host the files at
 * runtime; the difference is that this version makes no build-time request to
 * Google and guarantees the exact faces the huisstijlhandboek specifies.
 *
 * `adjustFontFallback` still generates a metric-matched local fallback, which
 * is what removes the layout shift while the font downloads. That matters: the
 * target is green Core Web Vitals on a midrange Android over 4G.
 */
const ubuntu = localFont({
  src: [
    { path: '../fonts/Ubuntu-Light.ttf', weight: '300', style: 'normal' },
    { path: '../fonts/Ubuntu-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/Ubuntu-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/Ubuntu-Bold.ttf', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--py-font-ubuntu',
})

/**
 * Italic is used in exactly one place, the emphasised word in the hero
 * headline, so only the 700 italic face is loaded. Four unused italic weights
 * stay off the wire.
 */
const ubuntuItalic = localFont({
  src: [{ path: '../fonts/Ubuntu-BoldItalic.ttf', weight: '700', style: 'italic' }],
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
  themeColor: '#1a3580', // PY-Blauw, huisstijlhandboek 1.3
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
