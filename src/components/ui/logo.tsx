import Image from 'next/image'

import { SITE_NAME } from '@/lib/routes'

/**
 * The ParkingYou logo.
 *
 * The real mark, from the brand repository (rick040/PY-ASSETS,
 * `svg/atom/py-atom-logo-horizontal-{color,white}.svg`). It replaces the
 * prototype's approximation, which drew a pin-shaped badge in CSS, set a letter
 * P inside it and rendered the wordmark as live text. Three problems with that:
 * the badge was a guess at the beeldmerk, the wordmark depended on Ubuntu
 * having loaded, and neither matched the artwork on the signage.
 *
 * The official file carries the beeldmerk and the wordmark together, with the
 * wordmark as outlines, so it is correct before the font arrives and identical
 * to the sign at the garage entrance.
 *
 * The tagline stays live text rather than using `py-atom-text-tagline`, which
 * is itself a live-text SVG and would need the font anyway.
 */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`py-logo${inverted ? ' py-logo--inverted' : ''}`}>
      <Image
        className="py-logo__mark"
        src={inverted ? '/brand/horizontal-white.svg' : '/brand/horizontal-color.svg'}
        alt={SITE_NAME}
        width={92}
        height={25}
        priority
      />
      <small>The other way of parking</small>
    </span>
  )
}
