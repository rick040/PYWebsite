import Image from 'next/image'

import type { Location } from '@/lib/content/schema'

/**
 * Scroll-snap on a phone, a two-up grid from the medium breakpoint. No
 * JavaScript: a carousel that needs hydration to show its first image is the
 * classic way to lose LCP on a midrange Android.
 *
 * The first image is the LCP element on this template, so it is the only one
 * marked priority; the rest stay lazy.
 */
export function PhotoGallery({ photos, name }: { photos: Location['photos']; name: string }) {
  const [first, ...rest] = photos
  if (first === undefined) return null

  return (
    <div
      className={[
        'flex snap-x snap-mandatory gap-[var(--py-space-3)] overflow-x-auto',
        'md:grid md:grid-cols-2 md:overflow-visible',
      ].join(' ')}
    >
      {[first, ...rest].map((photo, index) => (
        <div
          key={photo.src}
          className={[
            'relative w-[85%] shrink-0 snap-start overflow-hidden md:w-auto',
            'rounded-[var(--py-radius-lg)] bg-surface-sunken',
            rest.length === 0 ? 'md:col-span-2' : '',
          ].join(' ')}
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 768px) 50vw, 85vw"
            priority={index === 0}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            className="object-cover"
          />
        </div>
      ))}
      <span className="sr-only">{`Foto's van ${name}`}</span>
    </div>
  )
}
