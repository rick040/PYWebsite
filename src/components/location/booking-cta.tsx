import { ButtonLink } from '@/components/ui/button'
import { formatEuros } from '@/lib/format'
import type { Location } from '@/lib/content/schema'

/**
 * The booking call to action.
 *
 * It deep links into Aeroparker and never posts anything: Aeroparker is the
 * system of record for bookings and this site is read-only against it. The
 * Phase 3 client replaces `bookingUrl` with the per-quote BookingURL that
 * Aeroparker returns, with the dates prefilled.
 */
export function BookingCta({
  location,
  className,
}: {
  location: Location
  className?: string | undefined
}) {
  const price = location.sync.lowestPriceCents

  return (
    <div className={className}>
      <ButtonLink
        href={location.bookingUrl}
        size="lg"
        rel="noopener"
        aria-label={`Reserveer een plek bij ${location.name}`}
      >
        Reserveer je plek
      </ButtonLink>
      {price !== null && (
        <p className="mt-[var(--py-space-2)] text-sm text-foreground-muted">
          Dagkaart vanaf {formatEuros(price)} bij online reserveren.
        </p>
      )}
    </div>
  )
}

/**
 * Sticky bar on a phone only. Pure CSS, so it costs nothing in JavaScript and
 * cannot shift layout during hydration. The spacer keeps it from covering the
 * end of the page.
 */
export function StickyBookingBar({ location }: { location: Location }) {
  const price = location.sync.lowestPriceCents

  return (
    <>
      <div aria-hidden="true" className="h-[5.5rem] md:hidden" />
      <div
        className={[
          'fixed inset-x-0 bottom-0 z-40 md:hidden',
          'border-t border-border bg-surface/95 backdrop-blur',
          'px-[var(--py-space-gutter)] py-[var(--py-space-3)]',
          'shadow-[var(--py-shadow-lg)]',
        ].join(' ')}
      >
        <div className="flex items-center gap-[var(--py-space-3)]">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-[var(--py-weight-semibold)]">{location.name}</p>
            {price !== null && (
              <p className="truncate text-sm text-foreground-muted">
                vanaf {formatEuros(price)} per dag
              </p>
            )}
          </div>
          <ButtonLink href={location.bookingUrl} rel="noopener" className="shrink-0">
            Reserveren
          </ButtonLink>
        </div>
      </div>
    </>
  )
}
