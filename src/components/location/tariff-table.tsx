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
          className={[
            'rounded-[var(--py-radius-md)] border border-border',
            'bg-warning-surface text-warning',
            'px-[var(--py-space-4)] py-[var(--py-space-3)] text-sm',
          ].join(' ')}
        >
          Deze tarieven zijn voor het laatst bevestigd op {formatDate(sync.syncedAt)}. Bij het
          reserveren zie je altijd de prijs die op dat moment geldt.
        </p>
      )}

      {tariffs.map((group) => (
        <section key={group.title} aria-labelledby={`tarief-${slugify(group.title)}`}>
          <h3
            id={`tarief-${slugify(group.title)}`}
            className="mb-[var(--py-space-2)] text-lg font-[var(--py-weight-semibold)]"
          >
            {group.title}
          </h3>
          <Card>
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">{`${group.title} voor ${location.name}`}</caption>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-b-0">
                    <th
                      scope="row"
                      className={[
                        'p-[var(--py-space-4)] align-top',
                        'font-[var(--py-weight-normal)]',
                      ].join(' ')}
                    >
                      {row.label}
                      {row.note !== undefined && (
                        <span className="mt-[var(--py-space-1)] block text-sm text-foreground-muted">
                          {row.note}
                        </span>
                      )}
                    </th>
                    <td className="p-[var(--py-space-4)] text-right align-top whitespace-nowrap">
                      <span className="font-[var(--py-weight-semibold)]">
                        {formatEurosExact(row.amountCents)}
                      </span>
                      <span className="block text-sm text-foreground-muted">
                        {formatTariffUnit(row.unit)}
                      </span>
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
