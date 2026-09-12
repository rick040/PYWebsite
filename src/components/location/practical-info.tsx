import { Card, CardBody } from '@/components/ui/card'
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
      <h3 id={id} className="mb-[var(--py-space-3)] text-lg font-[var(--py-weight-semibold)]">
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
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">{`Openingstijden van ${location.name}`}</caption>
              <tbody>
                {location.openingHours.map((hours) => (
                  <tr key={hours.day} className="border-b border-border last:border-b-0">
                    <th
                      scope="row"
                      className={[
                        'px-[var(--py-space-4)] py-[var(--py-space-2)]',
                        'font-[var(--py-weight-normal)] capitalize',
                      ].join(' ')}
                    >
                      {formatDayName(hours.day)}
                    </th>
                    <td className="px-[var(--py-space-4)] py-[var(--py-space-2)] text-right">
                      {formatOpeningHours(hours)}
                    </td>
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

  const facts: ReadonlyArray<{ label: string; value: string }> = [
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
      ? [{ label: 'Parkeerplaatsen', value: String(location.capacity) }]
      : []),
    ...(location.walkingDistanceToCenterMinutes !== undefined
      ? [
          {
            label: 'Lopen naar het centrum',
            value: `${location.walkingDistanceToCenterMinutes} minuten`,
          },
        ]
      : []),
    ...(a === undefined
      ? []
      : [
          { label: 'Overdekt', value: a.covered ? 'Ja' : 'Nee' },
          { label: 'Lift', value: a.hasElevator ? 'Ja' : 'Nee' },
          { label: 'Rolstoeltoegankelijk', value: a.wheelchairAccessible ? 'Ja' : 'Nee' },
          { label: 'Cameratoezicht', value: a.cameraSurveillance ? 'Ja' : 'Nee' },
          { label: 'Laadpaal', value: a.evCharging ? 'Ja' : 'Nee' },
        ]),
  ]

  if (facts.length === 0) return null

  return (
    <Card>
      <CardBody>
        <dl className="grid gap-x-[var(--py-space-6)] gap-y-[var(--py-space-3)] sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-sm text-foreground-muted">{fact.label}</dt>
              <dd className="font-[var(--py-weight-medium)]">{fact.value}</dd>
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
