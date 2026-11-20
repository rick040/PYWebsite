import Image from 'next/image'

/**
 * Official ParkingYou pictograms, from the huisstijlhandboek via
 * rick040/PY-ASSETS (`svg/atom/`).
 *
 * These are the same symbols that appear on the signage inside the garages, so
 * a visitor recognises on the page what they will read at the entrance. That is
 * the whole point of a wayfinding system, and it is why these are not drawn
 * here: `Icon` stays for interface chrome, this is for the physical world.
 *
 * Deliberately NOT included: the payment marks (`py-atom-payment-*`), the RVV
 * road signs beyond the height restriction, and the escape-route symbols. The
 * brand repository tags those `third-party` and says "reference only: source
 * the official files". Shipping Mastercard or Maestro artwork extracted from a
 * handbook is a trademark problem, not a design decision.
 */
export type PictogramName =
  | 'accessible'
  | 'car'
  | 'ev'
  | 'lift'
  | 'pedestrian'
  | 'toilet'
  | 'info'
  | 'family'
  | 'motorcycle'
  | 'stairs'
  | 'escalator'
  | 'payment-machine'
  | 'camera'
  | 'location-pin'
  | 'calendar'
  | 'headset'
  | 'info-bubble'
  | 'warning'
  | 'max-height'

const FILES: Readonly<Record<PictogramName, string>> = {
  accessible: 'picto-accessible',
  car: 'picto-car',
  ev: 'picto-ev',
  lift: 'picto-lift',
  pedestrian: 'picto-pedestrian',
  toilet: 'picto-toilet',
  info: 'picto-info',
  family: 'picto-family',
  motorcycle: 'picto-motorcycle',
  stairs: 'picto-stairs',
  escalator: 'picto-escalator',
  'payment-machine': 'picto-payment-machine',
  camera: 'sign-camera',
  'location-pin': 'icon-location-pin',
  calendar: 'icon-calendar',
  headset: 'icon-headset-agent',
  'info-bubble': 'icon-info-bubble',
  warning: 'icon-warning-triangle',
  'max-height': 'rvv-max-height',
}

/**
 * Decorative by default. A pictogram here always sits next to its own label, so
 * repeating that label to a screen reader is noise; pass `label` only where the
 * symbol stands alone.
 */
export function Pictogram({
  name,
  size = 24,
  label,
  className,
}: {
  name: PictogramName
  size?: number
  label?: string
  className?: string
}) {
  return (
    <Image
      src={`/pictogrammen/${FILES[name]}.svg`}
      alt={label ?? ''}
      width={size}
      height={size}
      aria-hidden={label === undefined}
      className={className}
      style={{ width: size, height: 'auto' }}
    />
  )
}
