import type { City, Location } from './content/schema'

/**
 * Every internal URL is built here.
 *
 * Paths are Dutch and follow docs/IA.md: nothing hand-types a href, so a slug
 * change cannot leave a broken link behind. Phase 2 adds the /en locale prefix
 * in one place, here, rather than in every template.
 */

export const routes = {
  home: (): string => '/',
  locations: (): string => '/locaties',
  city: (city: Pick<City, 'slug'>): string => `/parkeren/${city.slug}`,
  location: (city: Pick<City, 'slug'>, location: Pick<Location, 'slug'>): string =>
    `/parkeren/${city.slug}/${location.slug}`,
  poi: (city: Pick<City, 'slug'>, poiSlug: string): string =>
    `/parkeren-bij/${city.slug}/${poiSlug}`,
  subscriptions: (): string => '/abonnementen',
  subscriptionRequest: (): string => '/abonnementen/aanvragen',
  parkingPass: (): string => '/parkingpass',
  business: (): string => '/zakelijk',
  faq: (): string => '/veelgestelde-vragen',
  news: (): string => '/nieuws',
  about: (): string => '/over-ons',
  contact: (): string => '/contact',
} as const

export const SITE_NAME = 'ParkingYou'

/**
 * Used for canonical URLs and OpenGraph. Overridden per environment in Phase 5;
 * the production value is not a secret and belongs in configuration, not here.
 */
export const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://www.parkingyou.nl'

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}
