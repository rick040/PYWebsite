import { Card, CardBody } from '@/components/ui/card'
import { Pictogram, type PictogramName } from '@/components/ui/pictogram'
import { formatDayName, formatMeters, formatOpeningHours } from '@/lib/format'
import type { Location } from '@/lib/content/schema'

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-[var(--py-space-2)] pl-[var(--py-space-5)]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="mb-[var(--py-space-3)] text-lg font-[var(--py-weight-bold)] text-foreground-brand">
        {title}
      </h3>
      {children}
    </section>
  )
}

/**
 * Every block renders only when it has content. 43 of the 46 locations have
 * their Dutch copy but not yet their structured facts, and an empty "Inrijden"
 * heading with nothing under it is worse than no heading at all.
 */
export function RouteAndAccess({ location }: { location: Location }) {
  const blocks = [
    location.routeDescription.length > 0,
    location.openingHours !== undefined,
    location.entryInstructions.length > 0,
    location.exitInstructions.length > 0,
  ]
  if (!blocks.some(Boolean)) return null

  return (
    <div className="grid gap-[var(--py-space-6)] md:grid-cols-2">
      {location.routeDescription.length > 0 && (
        <Block id="route" title="Route en bereikbaarheid">
          <List items={location.routeDescription} />
        </Block>
      )}

      {location.openingHours !== undefined && (
        <Block id="openingstijden" title="Openingstijden">
          <Card>
            <table className="py-table">
              <caption className="sr-only">{`Openingstijden van ${location.name}`}</caption>
              <tbody>
                {location.openingHours.map((hours) => (
                  <tr key={hours.day}>
                    <th scope="row" className="capitalize">
                      {formatDayName(hours.day)}
                    </th>
                    <td>{formatOpeningHours(hours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Block>
      )}

      {location.entryInstructions.length > 0 && (
        <Block id="inrijden" title="Inrijden">
          <List items={location.entryInstructions} />
        </Block>
      )}

      {location.exitInstructions.length > 0 && (
        <Block id="uitrijden" title="Uitrijden">
          <List items={location.exitInstructions} />
        </Block>
      )}
    </div>
  )
}

export function AccessibilityFacts({ location }: { location: Location }) {
  const a = location.accessibility

  /*
   * Each fact carries its signage pictogram where the brand has one, so the
   * symbol on this page is the symbol on the sign at the entrance.
   *
   * Two rules, both learned the hard way by looking at the rendered page.
   *
   * A pictogram appears only when the answer is affirmative. A camera symbol
   * beside "Cameratoezicht: Nee" reads at a glance as "there is a camera",
   * which is exactly the opposite of the fact.
   *
   * Doorrijhoogte gets no pictogram at all. The brand's `rvv-max-height` sign
   * has its numerals baked into the artwork at 2,4 m, so next to a location
   * with a 2,00 m clearance it contradicts the text. A driver who trusts the
   * sign over the number hits the beam. A variable-height version belongs in
   * the brand repository before this comes back.
   */
  const facts: ReadonlyArray<{ label: string; value: string; picto?: PictogramName }> = [
    ...(a?.maxHeightMeters !== undefined
      ? [
          {
            label: 'Doorrijhoogte',
            value:
              a.maxHeightNote !== undefined
                ? `${formatMeters(a.maxHeightMeters)}. ${a.maxHeightNote}`
                : formatMeters(a.maxHeightMeters),
          },
        ]
      : []),
    ...(location.capacity !== undefined
      ? [
          {
            label: 'Parkeerplaatsen',
            value: String(location.capacity),
            picto: 'car' as const,
          },
        ]
      : []),
    ...(location.walkingDistanceToCenterMinutes !== undefined
      ? [
          {
            label: 'Lopen naar het centrum',
            value: `${location.walkingDistanceToCenterMinutes} minuten`,
            picto: 'pedestrian' as const,
          },
        ]
      : []),
    ...(a === undefined
      ? []
      : [
          { label: 'Overdekt', value: a.covered ? 'Ja' : 'Nee' },
          {
            label: 'Lift',
            value: a.hasElevator ? 'Ja' : 'Nee',
            ...(a.hasElevator ? { picto: 'lift' as const } : {}),
          },
          {
            label: 'Rolstoeltoegankelijk',
            value: a.wheelchairAccessible ? 'Ja' : 'Nee',
            ...(a.wheelchairAccessible ? { picto: 'accessible' as const } : {}),
          },
          {
            label: 'Cameratoezicht',
            value: a.cameraSurveillance ? 'Ja' : 'Nee',
            ...(a.cameraSurveillance ? { picto: 'camera' as const } : {}),
          },
          {
            label: 'Laadpaal',
            value: a.evCharging ? 'Ja' : 'Nee',
            ...(a.evCharging ? { picto: 'ev' as const } : {}),
          },
        ]),
  ]

  if (facts.length === 0) return null

  return (
    <Card>
      <CardBody>
        <dl className="grid gap-x-[var(--py-space-6)] gap-y-[var(--py-space-3)] sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-start gap-[var(--py-space-3)]">
              {fact.picto !== undefined && (
                <Pictogram name={fact.picto} size={26} className="mt-[2px] shrink-0" />
              )}
              <div>
                <dt className="text-sm text-foreground-muted">{fact.label}</dt>
                <dd className="font-[var(--py-weight-medium)]">{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </CardBody>
    </Card>
  )
}

/** True when the practical section has anything at all to show. */
export function hasPracticalInfo(location: Location): boolean {
  return (
    location.accessibility !== undefined ||
    location.capacity !== undefined ||
    location.walkingDistanceToCenterMinutes !== undefined ||
    location.openingHours !== undefined ||
    location.routeDescription.length > 0 ||
    location.entryInstructions.length > 0 ||
    location.exitInstructions.length > 0
  )
}
