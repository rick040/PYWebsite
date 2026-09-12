import Link from 'next/link'

import { Card, CardBody } from '@/components/ui/card'
import { getCities, getCityById, getLocations } from '@/lib/content'
import { formatEuros } from '@/lib/format'
import { routes } from '@/lib/routes'

/**
 * Phase 1 home page.
 *
 * Deliberately thin: the brief puts the location template first as the
 * reference page, and this exists so the prototype is navigable on a phone.
 * The real home page is built alongside the city, POI, abonnementen, zakelijk,
 * FAQ, nieuws and contact templates.
 */
export default function HomePage() {
  const cities = getCities()
  const locations = getLocations()

  return (
    <div className="py-container flex flex-col gap-[var(--py-space-section)] py-[var(--py-space-8)]">
      <section className="py-prose flex flex-col gap-[var(--py-space-4)]">
        <h1 className="text-4xl">Goedkoop en centraal parkeren</h1>
        <p className="text-lg text-foreground-muted">
          Reserveer je parkeerplek vooraf online. Je betaalt minder dan aan de slagboom en je rijdt
          zo door: bij aankomst herkent de camera je kenteken.
        </p>
      </section>

      <section aria-labelledby="locaties" className="flex flex-col gap-[var(--py-space-4)]">
        <h2 id="locaties" className="text-2xl">
          Onze locaties
        </h2>
        <ul className="grid gap-[var(--py-space-4)] sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => {
            const city = getCityById(location.cityId)
            if (city === undefined) return null
            return (
              <li key={location.id}>
                <Card className="relative h-full transition-shadow hover:shadow-[var(--py-shadow-md)]">
                  <CardBody className="flex h-full flex-col gap-[var(--py-space-2)]">
                    <p className="text-sm text-foreground-muted">{city.name}</p>
                    <h3 className="text-lg font-[var(--py-weight-semibold)]">
                      <Link href={routes.location(city, location)} className="no-underline">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {location.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-foreground-muted">{location.shortDescription}</p>
                    {location.sync.lowestPriceCents !== null && (
                      <p className="mt-auto pt-[var(--py-space-2)] font-[var(--py-weight-semibold)]">
                        vanaf {formatEuros(location.sync.lowestPriceCents)} per dag
                      </p>
                    )}
                  </CardBody>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="steden" className="flex flex-col gap-[var(--py-space-3)]">
        <h2 id="steden" className="text-2xl">
          Parkeren per stad
        </h2>
        <ul className="flex flex-wrap gap-[var(--py-space-3)]">
          {cities.map((city) => (
            <li key={city.id}>
              <Link
                href={routes.city(city)}
                className={[
                  'inline-flex min-h-[var(--py-tap-target-min)] items-center',
                  'rounded-[var(--py-radius-md)] border border-border-strong',
                  'px-[var(--py-space-4)] no-underline hover:bg-surface-subtle',
                ].join(' ')}
              >
                Parkeren in {city.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
