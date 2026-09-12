import Link from 'next/link'

import { getCities } from '@/lib/content'
import { routes, SITE_NAME } from '@/lib/routes'

export function SiteFooter() {
  const cities = getCities()

  return (
    <footer className="mt-[var(--py-space-section)] border-t border-border bg-surface-subtle">
      <div className="py-container grid gap-[var(--py-space-8)] py-[var(--py-space-10)] sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-lg font-[var(--py-weight-bold)] text-foreground-brand">{SITE_NAME}</p>
          <address className="mt-[var(--py-space-2)] text-sm text-foreground-muted not-italic">
            ParkingYou B.V.
            <br />
            Victoriapark 4
            <br />
            5611 BM Eindhoven
            <br />
            <a href="tel:+31408200956" className="underline">
              040 8200 956
            </a>
            <br />
            <a href="mailto:info@parkingyou.nl" className="underline">
              info@parkingyou.nl
            </a>
          </address>
        </div>

        <nav aria-labelledby="footer-steden">
          <h2 id="footer-steden" className="font-[var(--py-weight-semibold)]">
            Parkeren per stad
          </h2>
          <ul className="mt-[var(--py-space-2)] flex flex-col gap-[var(--py-space-1)] text-sm">
            {cities.map((city) => (
              <li key={city.id}>
                <Link href={routes.city(city)} className="no-underline hover:underline">
                  Parkeren in {city.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-overig">
          <h2 id="footer-overig" className="font-[var(--py-weight-semibold)]">
            Meer informatie
          </h2>
          <ul className="mt-[var(--py-space-2)] flex flex-col gap-[var(--py-space-1)] text-sm">
            <li>
              <Link href={routes.subscriptions()} className="no-underline hover:underline">
                Abonnementen
              </Link>
            </li>
            <li>
              <Link href={routes.parkingPass()} className="no-underline hover:underline">
                ParkingPass
              </Link>
            </li>
            <li>
              <Link href={routes.business()} className="no-underline hover:underline">
                Zakelijk parkeren
              </Link>
            </li>
            <li>
              <Link href={routes.faq()} className="no-underline hover:underline">
                Veelgestelde vragen
              </Link>
            </li>
            <li>
              <Link href={routes.about()} className="no-underline hover:underline">
                Over ParkingYou
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
