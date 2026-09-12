import Link from 'next/link'

import { Icon } from '@/components/ui/icon'
import { formatEuros } from '@/lib/format'
import { routes } from '@/lib/routes'
import type { City, Location } from '@/lib/content/schema'

/**
 * The prototype's garage card: image band with a city pill, an overhanging
 * circular price badge, then the name and summary.
 *
 * The whole card is clickable through a stretched pseudo-link on the title, so
 * there is one link per card for a screen reader rather than three.
 */
export function LocationCard({
  location,
  city,
  showCity = true,
}: {
  location: Location
  city: City
  showCity?: boolean
}) {
  const price = location.sync.lowestPriceCents

  return (
    <article className="py-garage-card">
      <div className="py-garage-card__image">
        {showCity && <span className="py-garage-card__city">{city.name}</span>}
        <PlaceholderArt name={location.name} />
        {price !== null && (
          <span className="py-price-blob">
            <strong>{formatEuros(price)}</strong>
            <small>per dag</small>
          </span>
        )}
      </div>

      <div className="py-garage-card__body">
        <h3>
          <Link href={routes.location(city, location)}>
            <span className="absolute inset-0" aria-hidden="true" />
            {location.name}
          </Link>
        </h3>
        <p>{location.shortDescription}</p>
        {price === null && <p className="py-garage-card__price">Bekijk de tarieven</p>}
      </div>
    </article>
  )
}

/**
 * Stands in for photography we do not have yet. Deliberately abstract rather
 * than a fake photo: a stakeholder reviewing the site can tell at a glance
 * which car parks have real pictures and which do not.
 */
function PlaceholderArt({ name }: { name: string }) {
  return (
    <span className="py-garage-card__art" aria-hidden="true">
      <Icon name="car" size={44} stroke={1.4} />
      <span>{name}</span>
    </span>
  )
}

export function LocationGrid({
  locations,
  cityById,
  showCity = true,
}: {
  locations: readonly Location[]
  cityById: (id: string) => City | undefined
  showCity?: boolean
}) {
  return (
    <ul className="py-garage-grid">
      {locations.map((location) => {
        const city = cityById(location.cityId)
        if (city === undefined) return null
        return (
          <li key={location.id}>
            <LocationCard location={location} city={city} showCity={showCity} />
          </li>
        )
      })}
    </ul>
  )
}
