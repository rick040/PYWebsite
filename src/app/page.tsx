import type { Metadata } from 'next'
import Link from 'next/link'

import { LocationGrid } from '@/components/site/location-card'
import { Card, CardBody } from '@/components/ui/card'
import { ButtonLink } from '@/components/ui/button'
import { getCities, getCityById, getLocations, getNews, getPois } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { absoluteUrl, routes } from '@/lib/routes'

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl(routes.home()) },
}

export default function HomePage() {
  const cities = getCities()
  const locations = getLocations()
  const pois = getPois()
  const articles = getNews().slice(0, 2)

  // Cities with the most locations first: that is where most visitors land.
  const featured = [...cities]
    .map((city) => ({
      city,
      locations: locations.filter((location) => location.cityId === city.id),
    }))
    .toSorted((a, b) => b.locations.length - a.locations.length)
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-[var(--py-space-section)] pb-[var(--py-space-section)]">
      <section className="bg-surface-brand text-foreground-on-brand">
        <div className="py-container flex flex-col gap-[var(--py-space-5)] py-[var(--py-space-12)]">
          <h1 className="py-prose text-4xl">Goedkoop en centraal parkeren in heel Nederland</h1>
          <p className="py-prose text-lg opacity-90">
            {locations.length} overdekte parkeerlocaties in {cities.length} steden. Reserveer
            vooraf online, betaal minder dan aan de slagboom en rijd bij aankomst zo door: je
            kenteken wordt herkend.
          </p>
          <div className="flex flex-wrap gap-[var(--py-space-3)]">
            <ButtonLink href={routes.locations()} variant="secondary" size="lg">
              Bekijk alle locaties
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="py-container flex flex-col gap-[var(--py-space-section)]">
        <section aria-labelledby="steden" className="flex flex-col gap-[var(--py-space-4)]">
          <h2 id="steden" className="text-2xl">
            Parkeren per stad
          </h2>
          <ul className="flex flex-wrap gap-[var(--py-space-2)]">
            {cities.map((city) => (
              <li key={city.id}>
                <Link
                  href={routes.city(city)}
                  className={[
                    'inline-flex min-h-[var(--py-tap-target-min)] items-center',
                    'rounded-[var(--py-radius-full)] border border-border-strong',
                    'px-[var(--py-space-4)] no-underline hover:bg-surface-subtle',
                  ].join(' ')}
                >
                  {city.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {featured.map(({ city, locations: cityLocations }) => (
          <section
            key={city.id}
            aria-labelledby={`home-${city.slug}`}
            className="flex flex-col gap-[var(--py-space-4)]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-[var(--py-space-2)]">
              <h2 id={`home-${city.slug}`} className="text-2xl">
                Parkeren in {city.name}
              </h2>
              <Link href={routes.city(city)} className="text-foreground-brand">
                Alle {cityLocations.length} locaties
              </Link>
            </div>
            <LocationGrid locations={cityLocations.slice(0, 3)} cityById={getCityById} />
          </section>
        ))}

        {pois.length > 0 && (
          <section aria-labelledby="bestemmingen" className="flex flex-col gap-[var(--py-space-4)]">
            <h2 id="bestemmingen" className="text-2xl">
              Parkeren bij een bestemming
            </h2>
            <ul className="grid gap-[var(--py-space-4)] sm:grid-cols-2 lg:grid-cols-4">
              {pois.map((poi) => {
                const city = getCityById(poi.cityId)
                if (city === undefined) return null
                return (
                  <li key={poi.id}>
                    <Card className="relative h-full transition-shadow hover:shadow-[var(--py-shadow-md)]">
                      <CardBody className="flex flex-col gap-[var(--py-space-1)]">
                        <p className="text-sm text-foreground-muted">{city.name}</p>
                        <h3 className="font-[var(--py-weight-semibold)]">
                          <Link href={routes.poi(city, poi.slug)} className="no-underline">
                            <span className="absolute inset-0" aria-hidden="true" />
                            Parkeren bij {poi.name}
                          </Link>
                        </h3>
                      </CardBody>
                    </Card>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section aria-labelledby="opties" className="flex flex-col gap-[var(--py-space-4)]">
          <h2 id="opties" className="text-2xl">
            Hoe vaak sta je er?
          </h2>
          <ul className="grid gap-[var(--py-space-4)] md:grid-cols-3">
            {[
              {
                title: 'Af en toe',
                body: 'Reserveer een losse dagkaart. Online vooraf is bijna altijd goedkoper dan betalen bij de slagboom.',
                href: routes.locations(),
                label: 'Bekijk locaties',
              },
              {
                title: 'Een paar dagen per week',
                body: 'Met een ParkingPass koop je tien of vijfentwintig parkeerdagen vooruit tegen een lager tarief.',
                href: routes.parkingPass(),
                label: 'Over de ParkingPass',
              },
              {
                title: 'Elke dag',
                body: 'Een abonnement geeft je een vast bedrag per maand op je eigen locatie, vanaf drie maanden.',
                href: routes.subscriptions(),
                label: 'Over abonnementen',
              },
            ].map((option) => (
              <li key={option.title}>
                <Card className="relative h-full">
                  <CardBody className="flex h-full flex-col gap-[var(--py-space-2)]">
                    <h3 className="text-lg font-[var(--py-weight-semibold)]">{option.title}</h3>
                    <p className="text-sm text-foreground-muted">{option.body}</p>
                    <Link
                      href={option.href}
                      className="mt-auto pt-[var(--py-space-2)] text-foreground-brand"
                    >
                      <span className="absolute inset-0" aria-hidden="true" />
                      {option.label}
                    </Link>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        {articles.length > 0 && (
          <section aria-labelledby="nieuws" className="flex flex-col gap-[var(--py-space-4)]">
            <div className="flex flex-wrap items-baseline justify-between gap-[var(--py-space-2)]">
              <h2 id="nieuws" className="text-2xl">
                Nieuws
              </h2>
              <Link href={routes.news()} className="text-foreground-brand">
                Alle berichten
              </Link>
            </div>
            <ul className="grid gap-[var(--py-space-4)] md:grid-cols-2">
              {articles.map((article) => (
                <li key={article.id}>
                  <Card className="relative h-full">
                    <CardBody className="flex flex-col gap-[var(--py-space-2)]">
                      <time
                        dateTime={article.publishedAt}
                        className="text-sm text-foreground-muted"
                      >
                        {formatDate(article.publishedAt)}
                      </time>
                      <h3 className="text-lg font-[var(--py-weight-semibold)]">
                        <Link href={`${routes.news()}/${article.slug}`} className="no-underline">
                          <span className="absolute inset-0" aria-hidden="true" />
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-foreground-muted">{article.excerpt}</p>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
