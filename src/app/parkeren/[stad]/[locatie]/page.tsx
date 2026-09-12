import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { BookingCta, StickyBookingBar } from '@/components/location/booking-cta'
import { FaqBlock } from '@/components/location/faq-block'
import { LocationMap } from '@/components/location/location-map'
import { PhotoGallery } from '@/components/location/photo-gallery'
import {
  AccessibilityFacts,
  hasPracticalInfo,
  RouteAndAccess,
} from '@/components/location/practical-info'
import { RelatedLocations } from '@/components/location/related-locations'
import { TariffTable } from '@/components/location/tariff-table'
import { Badge } from '@/components/ui/card'
import {
  getAllLocationParams,
  getCityById,
  getFaqsByIds,
  getLocation,
  getPoisForLocation,
  getSiblingLocations,
} from '@/lib/content'
import { absoluteUrl, routes } from '@/lib/routes'

type PageParams = { stad: string; locatie: string }

export function generateStaticParams(): PageParams[] {
  return [...getAllLocationParams()]
}

/** Nothing here is dynamic in Phase 1, so every page is statically rendered. */
export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { stad, locatie } = await params
  const location = getLocation(stad, locatie)
  if (location === undefined) return {}

  const city = getCityById(location.cityId)
  if (city === undefined) return {}

  const canonical = absoluteUrl(routes.location(city, location))

  return {
    title: location.seo.title,
    description: location.seo.description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      url: canonical,
      title: location.seo.title,
      description: location.seo.description,
      images: location.photos.map((photo) => ({
        url: photo.src,
        width: photo.width,
        height: photo.height,
        alt: photo.alt,
      })),
    },
  }
}

/**
 * The location page: the reference template for the whole site.
 *
 * Order is driven by what a driver needs in the ten minutes before they set
 * off, not by what is easy to lay out: what does it cost, how do I get in, how
 * do I get out, how far is it, can I book it now. The booking CTA appears above
 * the fold and again as a sticky bar on a phone.
 *
 * This is a Server Component and ships no client JavaScript of its own. The
 * gallery is scroll-snap, the FAQ is <details>, the sticky bar is CSS.
 */
export default async function LocationPage({ params }: { params: Promise<PageParams> }) {
  const { stad, locatie } = await params
  const location = getLocation(stad, locatie)
  if (location === undefined) notFound()

  const city = getCityById(location.cityId)
  if (city === undefined) notFound()

  const faqs = getFaqsByIds(location.faqIds)
  const siblings = getSiblingLocations(location)
  const pois = getPoisForLocation(location.id)

  return (
    <article className="py-container flex flex-col gap-[var(--py-space-section)] py-[var(--py-space-6)]">
      <header className="flex flex-col gap-[var(--py-space-5)]">
        <Breadcrumbs
          items={[
            { label: 'Home', href: routes.home() },
            { label: 'Parkeren', href: routes.locations() },
            { label: city.name, href: routes.city(city) },
            { label: location.name },
          ]}
        />

        <PhotoGallery photos={location.photos} name={location.name} />

        <div className="grid gap-[var(--py-space-6)] lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex flex-col gap-[var(--py-space-4)]">
            <h1 className="text-4xl">{location.h1}</h1>
            <p className="py-prose text-lg text-foreground-muted">{location.shortDescription}</p>
            <p className="text-foreground-muted">
              {location.address.street} {location.address.houseNumber}, {location.address.city}
            </p>
            {location.features.length > 0 && (
              <ul className="flex flex-wrap gap-[var(--py-space-2)]">
                {location.features.map((feature) => (
                  <li key={feature}>
                    <Badge>{feature}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <BookingCta
            location={location}
            className={[
              'hidden self-start rounded-[var(--py-radius-lg)] border border-border',
              'bg-surface-subtle p-[var(--py-space-5)] lg:block',
            ].join(' ')}
          />
        </div>
      </header>

      <div className="py-prose">
        {location.body.map((section) => (
          <section
            key={section.heading}
            className={
              section.tone === 'warning'
                ? [
                    'rounded-[var(--py-radius-lg)] border border-border',
                    'bg-warning-surface p-[var(--py-space-5)]',
                  ].join(' ')
                : undefined
            }
          >
            <h2 className={section.tone === 'warning' ? 'text-xl text-warning' : undefined}>
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-[var(--py-space-3)]">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      <section aria-labelledby="tarieven" className="flex flex-col gap-[var(--py-space-4)]">
        <h2 id="tarieven" className="text-2xl">
          Tarieven
        </h2>
        <TariffTable location={location} />
        <BookingCta location={location} className="lg:hidden" />
      </section>

      {hasPracticalInfo(location) && (
        <section aria-labelledby="praktisch" className="flex flex-col gap-[var(--py-space-6)]">
          <h2 id="praktisch" className="text-2xl">
            Praktische informatie
          </h2>
          <AccessibilityFacts location={location} />
          <RouteAndAccess location={location} />
        </section>
      )}

      <section aria-labelledby="kaart" className="flex flex-col gap-[var(--py-space-4)]">
        <h2 id="kaart" className="text-2xl">
          Waar vind je ons
        </h2>
        <LocationMap location={location} />
      </section>

      <FaqBlock faqs={faqs} title={`Veelgestelde vragen over ${location.name}`} />

      {pois.length > 0 && (
        <section aria-labelledby="bestemmingen" className="flex flex-col gap-[var(--py-space-3)]">
          <h2 id="bestemmingen" className="text-2xl">
            In de buurt
          </h2>
          <ul className="flex flex-col gap-[var(--py-space-2)]">
            {pois.map((poi) => (
              <li key={poi.id}>
                <Link href={routes.poi(city, poi.slug)} className="text-foreground-brand">
                  Parkeren bij {poi.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <RelatedLocations city={city} locations={siblings} />

      <StickyBookingBar location={location} />
    </article>
  )
}
