import Link from 'next/link'

import { Card, CardBody } from '@/components/ui/card'
import { formatEuros } from '@/lib/format'
import { routes } from '@/lib/routes'
import type { City, Location } from '@/lib/content/schema'

/**
 * Generated from the city relationship, never hand-typed. docs/IA.md 4 requires
 * that no page is an orphan and that internal links cannot go stale when a slug
 * changes; a list built from a query satisfies both by construction.
 */
export function RelatedLocations({
  city,
  locations,
}: {
  city: City
  locations: readonly Location[]
}) {
  if (locations.length === 0) return null

  return (
    <section aria-labelledby="andere-locaties">
      <h2
        id="andere-locaties"
        className="mb-[var(--py-space-4)] text-2xl font-[var(--py-weight-bold)]"
      >
        Andere locaties in {city.name}
      </h2>
      <ul className="grid gap-[var(--py-space-4)] sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <li key={location.id}>
            <Card className="relative h-full transition-shadow hover:shadow-[var(--py-shadow-md)]">
              <CardBody className="flex h-full flex-col gap-[var(--py-space-2)]">
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
        ))}
      </ul>
    </section>
  )
}
