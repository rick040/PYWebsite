import type { Metadata } from 'next'
import Link from 'next/link'

import { LocationGrid } from '@/components/site/location-card'
import { ButtonLink } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'
import { getCities, getCityById, getLocations, getPois } from '@/lib/content'
import { routes } from '@/lib/routes'
import { absoluteUrl } from '@/lib/routes'

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl(routes.home()) },
}

const BENEFITS: ReadonlyArray<{ icon: IconName; title: string; body: string }> = [
  {
    icon: 'car',
    title: 'Rij zo naar binnen',
    body: 'Je reserveert op kenteken. Bij aankomst herkent de camera je auto en gaat de slagboom open, zonder ticket.',
  },
  {
    icon: 'wallet',
    title: 'Je weet de prijs vooraf',
    body: 'Een gereserveerde dagkaart is vrijwel altijd goedkoper dan het losse tarief bij de slagboom.',
  },
  {
    icon: 'shield',
    title: 'Overdekt en bewaakt',
    body: 'Onze garages zijn overdekt, veel locaties hebben cameratoezicht en een lift naar straatniveau.',
  },
]

export default function HomePage() {
  const cities = getCities()
  const locations = getLocations()
  const pois = getPois()

  const featured = [...cities]
    .map((city) => ({
      city,
      locations: locations.filter((location) => location.cityId === city.id),
    }))
    .toSorted((a, b) => b.locations.length - a.locations.length)
    .slice(0, 1)

  return (
    <>
      <section className="py-hero">
        <div className="py-container py-hero__grid">
          <div>
            <h1>
              Parkeer <em>voordelig</em> midden in de stad.
            </h1>
            <p>
              Vind een ParkingYou-garage, reserveer je plek en rij in met kentekenherkenning.
              Minder rondjes rijden, meer tijd voor je dag.
            </p>
            <div className="py-action-row">
              <ButtonLink href={routes.locations()} variant="primary">
                Bekijk alle locaties
              </ButtonLink>
              <ButtonLink href={routes.subscriptions()} variant="outline" icon={null}>
                Ik parkeer hier vaker
              </ButtonLink>
            </div>
            <div className="py-quick-cities" aria-label="Populaire steden">
              {cities.slice(0, 5).map((city) => (
                <Link key={city.id} href={routes.city(city)} className="py-pill">
                  {city.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="py-hero__visual" aria-hidden="true">
            <div className="py-pin-photo">
              <span className="py-pin-photo__label">
                {'{{TODO-NL: sfeerfoto van een ParkingYou-garage}}'}
              </span>
            </div>
            <div className="py-hero-ticket">
              <span>
                <Icon name="check" size={18} stroke={2.4} /> Gereserveerd
              </span>
              <strong>Philips Stadion</strong>
              <small>Vandaag 09.00 tot 17.00 uur</small>
            </div>
            <div className="py-hero-stat">
              <strong>{locations.length}</strong>
              <span>garages in Nederland</span>
            </div>
          </div>
        </div>

        <div className="py-container py-proofbar">
          <div>
            <strong>{locations.length}</strong>
            <span>locaties in {cities.length} steden</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>in- en uitrijden</span>
          </div>
          <div>
            <strong>Kenteken</strong>
            <span>geen ticket nodig</span>
          </div>
          <div>
            <strong>500.000+</strong>
            <span>parkeerders per jaar</span>
          </div>
        </div>
      </section>

      <section className="py-city-strip">
        <div className="py-container">
          <ul className="py-city-strip__inner">
            {cities.slice(0, 10).map((city) => (
              <li key={city.id}>
                <Link href={routes.city(city)}>
                  {city.name}
                  <Icon name="arrow" size={18} stroke={2.2} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {featured.map(({ city, locations: cityLocations }) => (
        <section key={city.id} className="py-section">
          <div className="py-container">
            <div className="py-section-intro">
              <div>
                <h2>Parkeren in {city.name}</h2>
                <p>{city.intro}</p>
              </div>
              <ButtonLink href={routes.city(city)} variant="ghost">
                Alle {cityLocations.length} locaties
              </ButtonLink>
            </div>
            <LocationGrid locations={cityLocations.slice(0, 3)} cityById={getCityById} />
          </div>
        </section>
      ))}

      <section className="py-section py-section--paper">
        <div className="py-container">
          <div className="py-section-intro">
            <div>
              <h2>Waarom ParkingYou</h2>
              <p>
                We maken bestaande parkeerruimte beter benut. Dat levert jou een centrale plek op
                voor minder geld dan op straat.
              </p>
            </div>
          </div>
          <ul className="py-benefit-grid">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title}>
                <article>
                  <span className="py-icon-circle">
                    <Icon name={benefit.icon} size={22} />
                  </span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.body}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {pois.length > 0 && (
        <section className="py-section">
          <div className="py-container">
            <div className="py-section-intro">
              <div>
                <h2>Parkeren bij een bestemming</h2>
                <p>Ga je ergens specifieks naartoe? Dan wijzen we je de dichtstbijzijnde garage.</p>
              </div>
            </div>
            <ul className="py-benefit-grid">
              {pois.map((poi) => {
                const city = getCityById(poi.cityId)
                if (city === undefined) return null
                return (
                  <li key={poi.id}>
                    <article className="relative">
                      <span className="py-icon-circle">
                        <Icon name="pin" size={22} />
                      </span>
                      <h3>
                        <Link href={routes.poi(city, poi.slug)}>
                          <span className="absolute inset-0" aria-hidden="true" />
                          Parkeren bij {poi.name}
                        </Link>
                      </h3>
                      <p>{city.name}</p>
                    </article>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      <section className="py-banner">
        <div className="py-container py-banner__inner">
          <div>
            <h2>Sta je er vaker dan af en toe?</h2>
            <p>
              Met een ParkingPass koop je tien of vijfentwintig dagen vooruit. Sta je er elke dag,
              dan is een abonnement voordeliger.
            </p>
          </div>
          <div className="py-action-row">
            <ButtonLink href={routes.parkingPass()} variant="aqua">
              ParkingPass
            </ButtonLink>
            <ButtonLink href={routes.subscriptions()} variant="on-dark">
              Abonnementen
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
