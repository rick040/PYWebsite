import Image from 'next/image'

import type { Location } from '@/lib/content/schema'

type Photo = Location['photos'][number]

/**
 * A location without photography yet.
 *
 * Rendered instead of an <img>, on purpose: a generated stand-in that looks
 * like a photo is worse than an obvious gap, because a stakeholder reviewing
 * the page cannot tell which car parks we actually have pictures of. The alt
 * text is real, so this also shows exactly what the photo needs to depict.
 */
function PhotoPlaceholder({ photo }: { photo: Photo }) {
  return (
    <div
      className={[
        'flex h-full w-full flex-col justify-between gap-[var(--py-space-4)]',
        'bg-surface-brand p-[var(--py-space-5)] text-foreground-on-brand',
      ].join(' ')}
    >
      <p className="text-sm tracking-[0.08em] text-accent uppercase">Plaatshouder</p>
      <p className="text-lg">{photo.alt}</p>
      <p className="text-sm text-accent">{'{{TODO-NL: echte foto aanleveren}}'}</p>
    </div>
  )
}

/**
 * Scroll-snap on a phone, a two-up grid from the medium breakpoint. No
 * JavaScript: a carousel that needs hydration to show its first image is the
 * classic way to lose LCP on a midrange Android.
 *
 * The first image is the LCP element on this template, so it is the only one
 * marked priority; the rest stay lazy.
 */
export function PhotoGallery({ photos, name }: { photos: Location['photos']; name: string }) {
  if (photos.length === 0) return null

  return (
    <div
      className={[
        'flex snap-x snap-mandatory gap-[var(--py-space-3)] overflow-x-auto',
        'md:grid md:grid-cols-2 md:overflow-visible',
      ].join(' ')}
    >
      {photos.map((photo, index) => (
        <div
          key={photo.src}
          className={[
            'relative w-[85%] shrink-0 snap-start overflow-hidden md:w-auto',
            'rounded-[var(--py-radius-lg)] bg-surface-sunken',
            photos.length === 1 ? 'md:col-span-2' : '',
          ].join(' ')}
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        >
          {photo.placeholder ? (
            <PhotoPlaceholder photo={photo} />
          ) : (
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 768px) 50vw, 85vw"
              priority={index === 0}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              className="object-cover"
            />
          )}
        </div>
      ))}
      <span className="sr-only">{`Foto's van ${name}`}</span>
    </div>
  )
}
