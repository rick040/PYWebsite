import Link from 'next/link'

import { routes, SITE_NAME } from '@/lib/routes'

const NAV: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Locaties', href: routes.locations() },
  { label: 'Abonnementen', href: routes.subscriptions() },
  { label: 'ParkingPass', href: routes.parkingPass() },
  { label: 'Zakelijk', href: routes.business() },
  { label: 'Veelgestelde vragen', href: routes.faq() },
  { label: 'Contact', href: routes.contact() },
]

/**
 * The mobile menu is a native <details>, so the header ships no JavaScript.
 * Everything in the navigation is a real link, which also means it works before
 * hydration and on a flaky connection.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="py-container flex items-center justify-between gap-[var(--py-space-4)] py-[var(--py-space-4)]">
        <Link
          href={routes.home()}
          className="text-xl font-[var(--py-weight-bold)] text-foreground-brand no-underline"
        >
          {SITE_NAME}
        </Link>

        <nav aria-label="Hoofdmenu" className="hidden md:block">
          <ul className="flex items-center gap-[var(--py-space-6)]">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="no-underline hover:text-foreground-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <details className="md:hidden">
          <summary
            className={[
              'inline-flex items-center justify-center',
              'min-h-[var(--py-tap-target-min)] min-w-[var(--py-tap-target-min)]',
              'rounded-[var(--py-radius-md)] border border-border-strong px-[var(--py-space-3)]',
            ].join(' ')}
          >
            Menu
          </summary>
          <nav
            aria-label="Hoofdmenu"
            className={[
              'absolute inset-x-0 z-30 border-b border-border bg-surface',
              'px-[var(--py-space-gutter)] py-[var(--py-space-3)]',
              'shadow-[var(--py-shadow-md)]',
            ].join(' ')}
          >
            <ul className="flex flex-col">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-[var(--py-tap-target-min)] items-center no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  )
}
