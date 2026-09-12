import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { LocationGrid } from '@/components/site/location-card'
import { getCities, getCityById, getLocations, getLocationsByCityId } from '@/lib/content'
import { absoluteUrl, routes } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Alle parkeerlocaties van ParkingYou | ParkingYou',
  description:
    'Alle parkeerlocaties van ParkingYou, gegroepeerd per stad. Van Amsterdam en Rotterdam tot Zoetermeer, Almere en Heerhugowaard.',
  alternates: { canonical: absoluteUrl(routes.locations()) },
}

/** The hub. Every location is reachable from here, so nothing is an orphan. */
export default function LocationsPage() {
  const cities = getCities()
  const total = getLocations().length

  return (
    <div className="py-container flex flex-col gap-[var(--py-space-section)] py-[var(--py-space-6)]">
      <header className="flex flex-col gap-[var(--py-space-4)]">
        <Breadcrumbs items={[{ label: 'Home', href: routes.home() }, { label: 'Locaties' }]} />
        <h1 className="text-4xl">Alle parkeerlocaties</h1>
        <p className="py-prose text-lg text-foreground-muted">
          {total} locaties in {cities.length} steden. Reserveer vooraf online en rijd bij aankomst
          zo door: je kenteken wordt bij de slagboom herkend.
        </p>
      </header>

      <nav aria-label="Ga naar een stad">
        <ul className="flex flex-wrap gap-[var(--py-space-2)]">
          {cities.map((city) => (
            <li key={city.id}>
              <a
                href={`#${city.slug}`}
                className={[
                  'inline-flex min-h-[var(--py-tap-target-min)] items-center',
                  'rounded-[var(--py-radius-full)] border border-border-strong',
                  'px-[var(--py-space-4)] text-sm no-underline hover:bg-surface-subtle',
                ].join(' ')}
              >
                {city.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {cities.map((city) => {
        const locations = getLocationsByCityId(city.id)
        return (
          <section
            key={city.id}
            id={city.slug}
            aria-labelledby={`kop-${city.slug}`}
            className="flex scroll-mt-[var(--py-space-8)] flex-col gap-[var(--py-space-4)]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-[var(--py-space-2)]">
              <h2 id={`kop-${city.slug}`} className="text-2xl">
                {city.name}
              </h2>
              <a href={routes.city(city)} className="text-foreground-brand">
                Meer over parkeren in {city.name}
              </a>
            </div>
            <LocationGrid locations={locations} cityById={getCityById} />
          </section>
        )
      })}
    </div>
  )
}
