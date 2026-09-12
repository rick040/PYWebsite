import Link from 'next/link'

import { ButtonLink } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Logo } from '@/components/ui/logo'
import { routes } from '@/lib/routes'

const NAV: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Locaties', href: routes.locations() },
  { label: 'Abonnementen', href: routes.subscriptions() },
  { label: 'ParkingPass', href: routes.parkingPass() },
  { label: 'Zakelijk', href: routes.business() },
  { label: 'Over ons', href: routes.about() },
]

const PHONE_DISPLAY = '040 8200 956'
const PHONE_HREF = 'tel:+31408200956'

/**
 * The prototype's sticky, blurred header.
 *
 * The mobile menu is a native <details>, so the whole header ships no
 * JavaScript: it works before hydration and on a flaky connection, and it
 * cannot shift layout while a bundle downloads. The prototype used a
 * scroll listener to add a shadow; that is dropped rather than ported, because
 * a scroll handler on every frame is a poor trade for a hairline.
 */
export function SiteHeader() {
  return (
    <header className="py-header">
      <div className="py-container py-header__inner">
        <Link href={routes.home()} aria-label="ParkingYou, naar de homepage">
          <Logo />
        </Link>

        <nav className="py-header__nav" aria-label="Hoofdmenu">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="py-header__actions">
          <a className="py-header__phone" href={PHONE_HREF}>
            <Icon name="phone" size={16} />
            <span>{PHONE_DISPLAY}</span>
          </a>
          <ButtonLink href={routes.locations()} variant="primary">
            Direct reserveren
          </ButtonLink>
        </div>

        <details className="py-menu">
          <summary className="py-menu__button" aria-label="Menu openen">
            <Icon name="menu" size={28} stroke={2.3} />
          </summary>
          <nav className="py-menu__panel" aria-label="Hoofdmenu">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href={routes.faq()}>Veelgestelde vragen</Link>
            <Link href={routes.contact()}>Contact</Link>
            <a className="py-header__phone" href={PHONE_HREF}>
              <Icon name="phone" size={16} />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <ButtonLink href={routes.locations()} variant="primary" block>
              Direct reserveren
            </ButtonLink>
          </nav>
        </details>
      </div>
    </header>
  )
}
