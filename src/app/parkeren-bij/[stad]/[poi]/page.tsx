import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { FaqBlock } from '@/components/location/faq-block'
import { LocationGrid } from '@/components/site/location-card'
import { ProseSections } from '@/components/site/prose-sections'
import {
  getAllPoiParams,
  getCityById,
  getFaqsByIds,
  getLocationsByIds,
  getPoi,
} from '@/lib/content'
import { absoluteUrl, routes } from '@/lib/routes'

type PageParams = { stad: string; poi: string }

export function generateStaticParams(): PageParams[] {
  return [...getAllPoiParams()]
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { stad, poi: poiSlug } = await params
  const poi = getPoi(stad, poiSlug)
  if (poi === undefined) return {}
  const city = getCityById(poi.cityId)
  if (city === undefined) return {}

  const canonical = absoluteUrl(routes.poi(city, poi.slug))
  return {
    title: poi.seo.title,
    description: poi.seo.description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      url: canonical,
      title: poi.seo.title,
      description: poi.seo.description,
    },
  }
}

/**
 * The POI landing page: "parkeren bij X".
 *
 * It is a page about the destination, not about the car park, which is what
 * keeps it from being a thin duplicate of the location page. The schema
 * enforces that by requiring an intro of at least 120 characters and at least
 * one linked location.
 */
export default async function PoiPage({ params }: { params: Promise<PageParams> }) {
  const { stad, poi: poiSlug } = await params
  const poi = getPoi(stad, poiSlug)
  if (poi === undefined) notFound()

  const city = getCityById(poi.cityId)
  if (city === undefined) notFound()

  const locations = getLocationsByIds(poi.locationIds)
  const faqs = getFaqsByIds(poi.faqIds)

  return (
    <article className="py-container flex flex-col gap-[var(--py-space-section)] py-[var(--py-space-6)]">
      <header className="flex flex-col gap-[var(--py-space-4)]">
        <Breadcrumbs
          items={[
            { label: 'Home', href: routes.home() },
            { label: 'Parkeren', href: routes.locations() },
            { label: city.name, href: routes.city(city) },
            { label: `Parkeren bij ${poi.name}` },
          ]}
        />
        <h1 className="text-4xl">Parkeren bij {poi.name}</h1>
        <p className="py-prose text-lg text-foreground-muted">{poi.intro}</p>
      </header>

      <section aria-labelledby="waar-parkeren" className="flex flex-col gap-[var(--py-space-4)]">
        <h2 id="waar-parkeren" className="text-2xl">
          {locations.length === 1 ? 'Waar je parkeert' : 'Waar je kunt parkeren'}
        </h2>
        <LocationGrid locations={locations} cityById={getCityById} />
      </section>

      <ProseSections sections={poi.body} />

      <FaqBlock faqs={faqs} title={`Veelgestelde vragen over parkeren bij ${poi.name}`} />

      <p>
        <Link href={routes.city(city)} className="text-foreground-brand">
          Bekijk alle parkeerlocaties in {city.name}
        </Link>
      </p>
    </article>
  )
}
