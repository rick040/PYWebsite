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

export function RouteAndAccess({ location }: { location: Location }) {
  return (
    <div className="grid gap-[var(--py-space-6)] md:grid-cols-2">
      <section aria-labelledby="route">
        <h3 id="route" className="mb-[var(--py-space-3)] text-lg font-[var(--py-weight-semibold)]">
          Route en bereikbaarheid
        </h3>
        <List items={location.routeDescription} />
      </section>

      <section aria-labelledby="openingstijden">
        <h3
          id="openingstijden"
          className="mb-[var(--py-space-3)] text-lg font-[var(--py-weight-semibold)]"
        >
          Openingstijden
        </h3>
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
      </section>

      <section aria-labelledby="inrijden">
        <h3
          id="inrijden"
          className="mb-[var(--py-space-3)] text-lg font-[var(--py-weight-semibold)]"
        >
          Inrijden
        </h3>
        <List items={location.entryInstructions} />
      </section>

      <section aria-labelledby="uitrijden">
        <h3
          id="uitrijden"
          className="mb-[var(--py-space-3)] text-lg font-[var(--py-weight-semibold)]"
        >
          Uitrijden
        </h3>
        <List items={location.exitInstructions} />
      </section>
    </div>
  )
}

export function AccessibilityFacts({ location }: { location: Location }) {
  const { accessibility: a } = location

  const facts: ReadonlyArray<{ label: string; value: string }> = [
    ...(a.maxHeightMeters !== undefined
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
    { label: 'Overdekt', value: a.covered ? 'Ja' : 'Nee' },
    { label: 'Lift', value: a.hasElevator ? 'Ja' : 'Nee' },
    { label: 'Rolstoeltoegankelijk', value: a.wheelchairAccessible ? 'Ja' : 'Nee' },
    { label: 'Cameratoezicht', value: a.cameraSurveillance ? 'Ja' : 'Nee' },
    { label: 'Laadpaal', value: a.evCharging ? 'Ja' : 'Nee' },
  ]

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
