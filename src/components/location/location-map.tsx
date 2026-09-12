import { Card, CardBody } from '@/components/ui/card'
import type { Location } from '@/lib/content/schema'

import { MapCanvas } from './map-canvas'

/**
 * Address first, map second.
 *
 * Most people tap through to their own navigation app rather than pan a map on
 * a phone, so that link is always present and never depends on JavaScript. The
 * map itself is opt-in; see MapCanvas for why.
 */
export function LocationMap({ location }: { location: Location }) {
  const { address, coordinates } = location
  const query = encodeURIComponent(
    `${location.name}, ${address.street} ${address.houseNumber}, ${address.city}`,
  )
  const hasCoordinates = coordinates !== undefined

  return (
    <Card>
      <CardBody className="flex flex-col gap-[var(--py-space-4)]">
        <div>
          <p className="font-[var(--py-weight-bold)]">{location.name}</p>
          <p className="text-foreground-muted">
            {address.street} {address.houseNumber}, {address.city}
          </p>
        </div>

        <a
          href={
            hasCoordinates
              ? `geo:${coordinates.lat},${coordinates.lng}?q=${query}`
              : `geo:0,0?q=${query}`
          }
          className="text-foreground-brand underline"
        >
          Open deze locatie in je navigatie-app
        </a>

        {hasCoordinates ? (
          <>
            <MapCanvas coordinates={coordinates} label={location.name} />
            {location.coordinatesSource === 'approximate' && (
              <p className="text-sm text-foreground-muted">
                De kaartpositie is bij benadering. De exacte ingang kan iets afwijken.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-foreground-muted">
            {'{{TODO-NL: coördinaten van deze locatie ontbreken nog}}'}
          </p>
        )}
      </CardBody>
    </Card>
  )
}
