import { LocationGrid } from '@/components/site/location-card'
import { getCityById } from '@/lib/content'
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
      <div className="py-section-intro">
        <h2 id="andere-locaties">Andere locaties in {city.name}</h2>
      </div>
      <LocationGrid locations={locations} cityById={getCityById} showCity={false} />
    </section>
  )
}
