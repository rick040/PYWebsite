import type { Metadata } from 'next'

import { LocationGrid } from '@/components/site/location-card'
import { PageHero } from '@/components/site/page-hero'
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
    <>
      <PageHero
        crumbs={[{ label: 'Home', href: routes.home() }, { label: 'Locaties' }]}
        title="Alle parkeerlocaties"
        intro={`${total} locaties in ${cities.length} steden. Reserveer vooraf online en rij bij aankomst zo door: je kenteken wordt bij de slagboom herkend.`}
      >
        <nav aria-label="Ga naar een stad" className="py-quick-cities">
          {cities.map((city) => (
            <a key={city.id} href={`#${city.slug}`} className="py-pill">
              {city.name}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="py-section py-container py-stack">
      {cities.map((city) => {
        const locations = getLocationsByCityId(city.id)
        return (
          <section
            key={city.id}
            id={city.slug}
            aria-labelledby={`kop-${city.slug}`}
            className="scroll-mt-[var(--py-space-8)]"
          >
            <div className="py-section-intro">
              <h2 id={`kop-${city.slug}`}>{city.name}</h2>
              <a href={routes.city(city)}>Meer over parkeren in {city.name}</a>
            </div>
            <LocationGrid locations={locations} cityById={getCityById} showCity={false} />
          </section>
        )
      })}
      </div>
    </>
  )
}
