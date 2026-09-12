import Link from 'next/link'

import { Card, CardBody } from '@/components/ui/card'
import { formatEuros } from '@/lib/format'
import { routes } from '@/lib/routes'
import type { City, Location } from '@/lib/content/schema'

/** One card, used by the home page, the locations hub, city pages and POI pages. */
export function LocationCard({
  location,
  city,
  showCity = false,
}: {
  location: Location
  city: City
  showCity?: boolean
}) {
  return (
    <Card className="relative h-full transition-shadow hover:shadow-[var(--py-shadow-md)]">
      <CardBody className="flex h-full flex-col gap-[var(--py-space-2)]">
        {showCity && <p className="text-sm text-foreground-muted">{city.name}</p>}
        <h3 className="text-lg font-[var(--py-weight-semibold)]">
          <Link href={routes.location(city, location)} className="no-underline">
            <span className="absolute inset-0" aria-hidden="true" />
            {location.name}
          </Link>
        </h3>
        <p className="text-sm text-foreground-muted">{location.shortDescription}</p>
        <p className="mt-auto pt-[var(--py-space-2)] text-sm font-[var(--py-weight-semibold)]">
          {location.sync.lowestPriceCents === null
            ? 'Bekijk de tarieven'
            : `vanaf ${formatEuros(location.sync.lowestPriceCents)} per dag`}
        </p>
      </CardBody>
    </Card>
  )
}

export function LocationGrid({
  locations,
  cityById,
  showCity = false,
}: {
  locations: readonly Location[]
  cityById: (id: string) => City | undefined
  showCity?: boolean
}) {
  return (
    <ul className="grid gap-[var(--py-space-4)] sm:grid-cols-2 lg:grid-cols-3">
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
