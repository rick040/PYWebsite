import Link from 'next/link'

import { Logo } from '@/components/ui/logo'
import { getCities } from '@/lib/content'
import { routes } from '@/lib/routes'

export function SiteFooter() {
  const cities = getCities()
  const year = 2026

  return (
    <footer className="py-footer">
      <div className="py-container">
        <div className="py-footer__grid">
          <div>
            <Logo inverted />
            <address>
              ParkingYou B.V.
              <br />
              Victoriapark 4, 5611 BM Eindhoven
              <br />
              <a href="tel:+31408200956">040 8200 956</a>
              <br />
              <a href="mailto:info@parkingyou.nl">info@parkingyou.nl</a>
            </address>
          </div>

          <nav aria-labelledby="footer-steden">
            <h2 id="footer-steden">Parkeren per stad</h2>
            <ul>
              {cities.slice(0, 7).map((city) => (
                <li key={city.id}>
                  <Link href={routes.city(city)}>{city.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-producten">
            <h2 id="footer-producten">Parkeren</h2>
            <ul>
              <li>
                <Link href={routes.locations()}>Alle locaties</Link>
              </li>
              <li>
                <Link href={routes.subscriptions()}>Abonnementen</Link>
              </li>
              <li>
                <Link href={routes.parkingPass()}>ParkingPass</Link>
              </li>
              <li>
                <Link href={routes.business()}>Zakelijk parkeren</Link>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-service">
            <h2 id="footer-service">Service</h2>
            <ul>
              <li>
                <Link href={routes.faq()}>Veelgestelde vragen</Link>
              </li>
              <li>
                <Link href={routes.contact()}>Contact</Link>
              </li>
              <li>
                <Link href={routes.news()}>Nieuws</Link>
              </li>
              <li>
                <Link href={routes.about()}>Over ParkingYou</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="py-footer__bottom">
          <span>
            &copy; {year} ParkingYou B.V. The other way of parking.
          </span>
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
        </div>
      </div>
    </footer>
  )
}
