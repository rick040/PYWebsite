import { Card } from '@/components/ui/card'
import type { Location } from '@/lib/content/schema'

/**
 * The map slot.
 *
 * Deliberately not a map yet. The brief specifies MapLibre GL with Protomaps or
 * PDOK tiles, and MapLibre is roughly 230 KB gzipped of JavaScript plus a tile
 * source. On a midrange Android over 4G that is the single largest thing this
 * page would download, so it is a decision to take on purpose rather than by
 * default, and it needs a tile provider chosen (see the Phase 1 report).
 *
 * What is here instead is the seam: the address, the coordinates, and a link
 * out to the visitor's own map application, which is what most people tap
 * anyway. Dropping MapLibre in later means replacing the body of this one
 * component. Nothing else on the page changes.
 */
export function LocationMap({ location }: { location: Location }) {
  const { address, coordinates } = location
  const query = encodeURIComponent(
    `${location.name}, ${address.street} ${address.houseNumber}, ${address.city}`,
  )

  return (
    <Card className="overflow-hidden">
      <div
        className={[
          'flex aspect-[16/9] flex-col items-center justify-center gap-[var(--py-space-2)]',
          'bg-surface-accent-subtle px-[var(--py-space-5)] text-center',
        ].join(' ')}
      >
        <p className="font-[var(--py-weight-semibold)]">{location.name}</p>
        <p className="text-foreground-muted">
          {address.street} {address.houseNumber}, {address.city}
        </p>
        <p className="text-sm text-foreground-muted">
          {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
          {location.coordinatesSource === 'approximate' && ' (bij benadering)'}
        </p>
      </div>
      <div className="border-t border-border p-[var(--py-space-4)]">
        <a
          href={`geo:${coordinates.lat},${coordinates.lng}?q=${query}`}
          className="text-foreground-brand underline"
        >
          Open deze locatie in je navigatie-app
        </a>
      </div>
    </Card>
  )
}
