import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/site/footer'
import { SiteHeader } from '@/components/site/header'
import { SITE_NAME, SITE_URL } from '@/lib/routes'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Goedkoop en centraal parkeren`,
    template: `%s`,
  },
  description:
    'Parkeer goedkoop en centraal in Eindhoven, Rotterdam, Amsterdam en tien andere steden. Reserveer online op kenteken en rijd zo door.',
  applicationName: SITE_NAME,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#203d8b',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl-NL">
      <body>
        <a
          href="#inhoud"
          className={[
            'sr-only focus:not-sr-only focus:absolute focus:z-50',
            'focus:m-[var(--py-space-2)] focus:rounded-[var(--py-radius-md)]',
            'focus:bg-primary focus:px-[var(--py-space-4)] focus:py-[var(--py-space-2)]',
            'focus:text-primary-foreground',
          ].join(' ')}
        >
          Naar de inhoud
        </a>
        <SiteHeader />
        <main id="inhoud">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
