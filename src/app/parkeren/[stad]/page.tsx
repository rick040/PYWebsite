import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { FaqBlock } from '@/components/location/faq-block'
import { LocationGrid } from '@/components/site/location-card'
import { Card, CardBody } from '@/components/ui/card'
import {
  getCities,
  getCityBySlug,
  getCityById,
  getFaqsByIds,
  getLocationsByCityId,
  getPoisByCityId,
} from '@/lib/content'
import { absoluteUrl, routes } from '@/lib/routes'

type PageParams = { stad: string }

export function generateStaticParams(): PageParams[] {
  return getCities().map((city) => ({ stad: city.slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { stad } = await params
  const city = getCityBySlug(stad)
  if (city === undefined) return {}

  const canonical = absoluteUrl(routes.city(city))
  return {
    title: city.seo.title,
    description: city.seo.description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      url: canonical,
      title: city.seo.title,
      description: city.seo.description,
    },
  }
}

/**
 * The city page answers "waar kan ik parkeren in {stad}".
 *
 * It links down to every location in the city and across to the POI pages for
 * that city, which is half of the internal-linking rule in docs/IA.md 4. The
 * other half is the location page linking back up here.
 */
export default async function CityPage({ params }: { params: Promise<PageParams> }) {
  const { stad } = await params
  const city = getCityBySlug(stad)
  if (city === undefined) notFound()

  const locations = getLocationsByCityId(city.id)
  const pois = getPoisByCityId(city.id)
  const faqs = getFaqsByIds(city.faqIds)
  const otherCities = getCities().filter((candidate) => candidate.id !== city.id)

  return (
    <div className="py-container flex flex-col gap-[var(--py-space-section)] py-[var(--py-space-6)]">
      <header className="flex flex-col gap-[var(--py-space-4)]">
        <Breadcrumbs
          items={[
            { label: 'Home', href: routes.home() },
            { label: 'Parkeren', href: routes.locations() },
            { label: city.name },
          ]}
        />
        <h1 className="text-4xl">Parkeren in {city.name}</h1>
        <p className="py-prose text-lg text-foreground-muted">{city.intro}</p>
      </header>

      <section aria-labelledby="locaties" className="flex flex-col gap-[var(--py-space-4)]">
        <h2 id="locaties" className="text-2xl">
          {locations.length === 1
            ? `Onze locatie in ${city.name}`
            : `Onze ${locations.length} locaties in ${city.name}`}
        </h2>
        <LocationGrid locations={locations} cityById={getCityById} />
      </section>

      {pois.length > 0 && (
        <section aria-labelledby="bestemmingen" className="flex flex-col gap-[var(--py-space-4)]">
          <h2 id="bestemmingen" className="text-2xl">
            Parkeren bij een bestemming
          </h2>
          <ul className="grid gap-[var(--py-space-4)] sm:grid-cols-2 lg:grid-cols-3">
            {pois.map((poi) => (
              <li key={poi.id}>
                <Card className="relative h-full transition-shadow hover:shadow-[var(--py-shadow-md)]">
                  <CardBody className="flex flex-col gap-[var(--py-space-2)]">
                    <h3 className="text-lg font-[var(--py-weight-semibold)]">
                      <Link href={routes.poi(city, poi.slug)} className="no-underline">
                        <span className="absolute inset-0" aria-hidden="true" />
                        Parkeren bij {poi.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-foreground-muted">{poi.intro}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <FaqBlock faqs={faqs} title={`Veelgestelde vragen over parkeren in ${city.name}`} />

      <nav aria-labelledby="andere-steden" className="flex flex-col gap-[var(--py-space-3)]">
        <h2 id="andere-steden" className="text-2xl">
          Parkeren in andere steden
        </h2>
        <ul className="flex flex-wrap gap-[var(--py-space-2)]">
          {otherCities.map((other) => (
            <li key={other.id}>
              <Link
                href={routes.city(other)}
                className={[
                  'inline-flex min-h-[var(--py-tap-target-min)] items-center',
                  'rounded-[var(--py-radius-full)] border border-border-strong',
                  'px-[var(--py-space-4)] text-sm no-underline hover:bg-surface-subtle',
                ].join(' ')}
              >
                {other.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
