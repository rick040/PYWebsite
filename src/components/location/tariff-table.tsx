import { Card, CardBody } from '@/components/ui/card'
import { formatDate, formatEurosExact, formatTariffUnit } from '@/lib/format'
import type { Location } from '@/lib/content/schema'

/**
 * Tariffs come from Aeroparker and are read-only everywhere in this codebase.
 *
 * The three states below are the whole point of the last-known-good design in
 * docs/AEROPARKER-AUDIT.md 5.1:
 *
 * - ok         render the tariffs
 * - stale      render the tariffs, say when they were last confirmed
 * - superseded render the last known good tariffs, say so, keep the CTA
 * - error      render nothing priced, send the visitor to the booking flow
 *
 * A visitor never sees an empty table with no explanation, and never sees a
 * price we are not confident in.
 */
export function TariffTable({ location }: { location: Location }) {
  const { tariffs, sync } = location

  if (sync.status === 'error' || tariffs.length === 0) {
    return (
      <Card>
        <CardBody>
          <p>
            De actuele tarieven voor deze locatie kunnen we op dit moment niet tonen. Je ziet de
            prijs voor jouw periode direct bij het reserveren.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-[var(--py-space-5)]">
      {(sync.status === 'stale' || sync.status === 'superseded') && (
        <p
          role="status"
          className="py-notice py-notice--warning"
        >
          Deze tarieven zijn voor het laatst bevestigd op {formatDate(sync.syncedAt)}. Bij het
          reserveren zie je altijd de prijs die op dat moment geldt.
        </p>
      )}

      {tariffs.map((group) => (
        <section key={group.title} aria-labelledby={`tarief-${slugify(group.title)}`}>
          <h3
            id={`tarief-${slugify(group.title)}`}
            className="mb-[var(--py-space-2)] text-lg font-[var(--py-weight-bold)] text-foreground-brand"
          >
            {group.title}
          </h3>
          <Card>
            <table className="py-table">
              <caption className="sr-only">{`${group.title} voor ${location.name}`}</caption>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">
                      {row.label}
                      {row.note !== undefined && <small>{row.note}</small>}
                    </th>
                    <td>
                      <strong>{formatEurosExact(row.amountCents)}</strong>
                      <small>{formatTariffUnit(row.unit)}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      ))}

      <p className="text-sm text-foreground-muted">
        Tarieven bijgewerkt op {formatDate(sync.syncedAt)}.
      </p>
    </div>
  )
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
