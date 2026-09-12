import { SITE_NAME } from '@/lib/routes'

/** The prototype's wordmark: a pin-shaped P badge next to the name and tagline. */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`py-logo${inverted ? ' py-logo--inverted' : ''}`}>
      <span className="py-logo__mark" aria-hidden="true">
        P
      </span>
      <span>
        <strong>{SITE_NAME}</strong>
        <small>The other way of parking</small>
      </span>
    </span>
  )
}
