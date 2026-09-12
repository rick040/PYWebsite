import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FaqBlock } from '@/components/location/faq-block'
import { LocationGrid } from '@/components/site/location-card'
import { PageHero } from '@/components/site/page-hero'
import { Icon } from '@/components/ui/icon'
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
    <>
      <PageHero
        crumbs={[
          { label: 'Home', href: routes.home() },
          { label: 'Parkeren', href: routes.locations() },
          { label: city.name },
        ]}
        title={`Parkeren in ${city.name}`}
        intro={city.intro}
      />

      <div className="py-section py-container py-stack">
        <section aria-labelledby="locaties">
          <div className="py-section-intro">
            <h2 id="locaties">
              {locations.length === 1
                ? `Onze locatie in ${city.name}`
                : `Onze ${locations.length} locaties in ${city.name}`}
            </h2>
          </div>
          <LocationGrid locations={locations} cityById={getCityById} showCity={false} />
        </section>

        {pois.length > 0 && (
          <section aria-labelledby="bestemmingen">
            <div className="py-section-intro">
              <h2 id="bestemmingen">Parkeren bij een bestemming</h2>
            </div>
            <ul className="py-benefit-grid">
              {pois.map((poi) => (
                <li key={poi.id}>
                  <article className="relative h-full">
                    <span className="py-icon-circle">
                      <Icon name="pin" size={22} />
                    </span>
                    <h3>
                      <Link href={routes.poi(city, poi.slug)}>
                        <span className="absolute inset-0" aria-hidden="true" />
                        Parkeren bij {poi.name}
                      </Link>
                    </h3>
                    <p>{poi.intro}</p>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        <FaqBlock faqs={faqs} title={`Veelgestelde vragen over parkeren in ${city.name}`} />

        <nav aria-labelledby="andere-steden">
          <div className="py-section-intro">
            <h2 id="andere-steden">Parkeren in andere steden</h2>
          </div>
          <div className="py-quick-cities">
            {otherCities.map((other) => (
              <Link key={other.id} href={routes.city(other)} className="py-pill">
                {other.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}
