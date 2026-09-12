import type { z } from 'zod'

import citiesJson from '@content/cities.json'
import faqsJson from '@content/faqs.json'
import locationsJson from '@content/locations.json'
import newsJson from '@content/news.json'
import pagesJson from '@content/pages.json'
import poiJson from '@content/poi.json'

import {
  CitiesFileSchema,
  FaqsFileSchema,
  LocationsFileSchema,
  NewsFileSchema,
  PagesFileSchema,
  PoisFileSchema,
  type City,
  type Faq,
  type FlatPage,
  type Location,
  type NewsArticle,
  type Poi,
} from './schema'

/**
 * The Phase 1 content layer.
 *
 * Content is validated once, at module load, against the schemas that mirror
 * docs/CONTENT-MODEL.md. A malformed content file fails the build with the
 * offending path named, rather than rendering a half-empty page.
 *
 * In Phase 2 these functions keep their signatures and read from Payload
 * instead. Templates should never import the JSON directly.
 */

function parseOrThrow<S extends z.ZodType>(label: string, schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data)
  if (result.success) return result.data

  const details = result.error.issues
    .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n')
  throw new Error(`Invalid content in ${label}:\n${details}`)
}

const cities: City[] = parseOrThrow('content/cities.json', CitiesFileSchema, citiesJson)
const locations: Location[] = parseOrThrow('content/locations.json', LocationsFileSchema, locationsJson)
const faqs: Faq[] = parseOrThrow('content/faqs.json', FaqsFileSchema, faqsJson)
const pois: Poi[] = parseOrThrow('content/poi.json', PoisFileSchema, poiJson)
const news: NewsArticle[] = parseOrThrow('content/news.json', NewsFileSchema, newsJson)
const pages: FlatPage[] = parseOrThrow('content/pages.json', PagesFileSchema, pagesJson)

/** Referential integrity the schemas cannot express on their own. */
function assertRelationships(): void {
  const cityIds = new Set(cities.map((city) => city.id))
  const faqIds = new Set(faqs.map((faq) => faq.id))
  const problems: string[] = []

  for (const location of locations) {
    if (!cityIds.has(location.cityId)) {
      problems.push(`Location "${location.id}" points at unknown city "${location.cityId}"`)
    }
    for (const faqId of location.faqIds) {
      if (!faqIds.has(faqId)) {
        problems.push(`Location "${location.id}" points at unknown FAQ "${faqId}"`)
      }
    }
  }

  for (const city of cities) {
    for (const faqId of city.faqIds) {
      if (!faqIds.has(faqId)) {
        problems.push(`City "${city.id}" points at unknown FAQ "${faqId}"`)
      }
    }
  }

  const locationIds = new Set(locations.map((location) => location.id))
  for (const poi of pois) {
    if (!cityIds.has(poi.cityId)) {
      problems.push(`POI "${poi.id}" points at unknown city "${poi.cityId}"`)
    }
    for (const id of poi.locationIds) {
      if (!locationIds.has(id)) {
        problems.push(`POI "${poi.id}" points at unknown location "${id}"`)
      }
    }
    for (const id of poi.faqIds) {
      if (!faqIds.has(id)) problems.push(`POI "${poi.id}" points at unknown FAQ "${id}"`)
    }
  }

  for (const article of news) {
    for (const id of article.relatedCityIds) {
      if (!cityIds.has(id)) problems.push(`News "${article.id}" points at unknown city "${id}"`)
    }
    for (const id of article.relatedLocationIds) {
      if (!locationIds.has(id)) {
        problems.push(`News "${article.id}" points at unknown location "${id}"`)
      }
    }
  }

  for (const page of pages) {
    for (const id of page.faqIds) {
      if (!faqIds.has(id)) problems.push(`Page "${page.id}" points at unknown FAQ "${id}"`)
    }
  }

  // The IA forbids orphans: a published city with no published locations has
  // nothing to link to and should not exist yet.
  for (const city of cities.filter((candidate) => candidate.published)) {
    const hasLocation = locations.some(
      (location) => location.published && location.cityId === city.id,
    )
    if (!hasLocation) {
      problems.push(`Published city "${city.id}" has no published locations (docs/IA.md 4)`)
    }
  }

  if (problems.length > 0) {
    throw new Error(`Content relationship errors:\n${problems.map((p) => `  ${p}`).join('\n')}`)
  }
}

assertRelationships()

export function getCities(): readonly City[] {
  return cities.filter((city) => city.published)
}

export function getCityBySlug(slug: string): City | undefined {
  return getCities().find((city) => city.slug === slug)
}

export function getCityById(id: string): City | undefined {
  return getCities().find((city) => city.id === id)
}

export function getLocations(): readonly Location[] {
  return locations.filter((location) => location.published)
}

export function getLocationsByCityId(cityId: string): readonly Location[] {
  return getLocations().filter((location) => location.cityId === cityId)
}

/**
 * Resolves a location from its URL pair. Returns undefined rather than throwing
 * so the route can answer with a 404.
 */
export function getLocation(citySlug: string, locationSlug: string): Location | undefined {
  const city = getCityBySlug(citySlug)
  if (city === undefined) return undefined
  return getLocations().find(
    (location) => location.cityId === city.id && location.slug === locationSlug,
  )
}

export function getFaqsByIds(ids: readonly string[]): readonly Faq[] {
  const published = new Map(faqs.filter((faq) => faq.published).map((faq) => [faq.id, faq]))
  return ids.flatMap((id) => {
    const faq = published.get(id)
    return faq === undefined ? [] : [faq]
  })
}

/**
 * Sibling locations in the same city, used for the "other locations" block.
 * Generated from the relationship, never hand-typed, so it cannot go stale.
 */
export function getSiblingLocations(location: Location, limit = 3): readonly Location[] {
  return getLocationsByCityId(location.cityId)
    .filter((candidate) => candidate.id !== location.id)
    .slice(0, limit)
}

/** Every city and location slug pair, for generateStaticParams. */
export function getAllLocationParams(): ReadonlyArray<{ stad: string; locatie: string }> {
  return getLocations().flatMap((location) => {
    const city = getCityById(location.cityId)
    return city === undefined ? [] : [{ stad: city.slug, locatie: location.slug }]
  })
}

export function getPois(): readonly Poi[] {
  return pois.filter((poi) => poi.published)
}

export function getPoi(citySlug: string, poiSlug: string): Poi | undefined {
  const city = getCityBySlug(citySlug)
  if (city === undefined) return undefined
  return getPois().find((poi) => poi.cityId === city.id && poi.slug === poiSlug)
}

/** POI pages that link to this location. Generated, so it cannot go stale. */
export function getPoisForLocation(locationId: string): readonly Poi[] {
  return getPois().filter((poi) => poi.locationIds.includes(locationId))
}

export function getPoisByCityId(cityId: string): readonly Poi[] {
  return getPois().filter((poi) => poi.cityId === cityId)
}

export function getLocationsByIds(ids: readonly string[]): readonly Location[] {
  const byId = new Map(getLocations().map((location) => [location.id, location]))
  return ids.flatMap((id) => {
    const location = byId.get(id)
    return location === undefined ? [] : [location]
  })
}

export function getAllPoiParams(): ReadonlyArray<{ stad: string; poi: string }> {
  return getPois().flatMap((poi) => {
    const city = getCityById(poi.cityId)
    return city === undefined ? [] : [{ stad: city.slug, poi: poi.slug }]
  })
}

export function getNews(): readonly NewsArticle[] {
  return news
    .filter((article) => article.published)
    .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function getNewsArticle(slug: string): NewsArticle | undefined {
  return getNews().find((article) => article.slug === slug)
}

export function getPage(slug: string): FlatPage | undefined {
  return pages.find((page) => page.published && page.slug === slug)
}

/** Every FAQ marked for the general FAQ page, grouped by category. */
export function getGeneralFaqs(): readonly Faq[] {
  return faqs.filter((faq) => faq.published && faq.showOnGeneralFaq)
}

/** The city URL for a location, resolved through its relationship. */
export function getCityForLocation(location: Location): City | undefined {
  return getCityById(location.cityId)
}

export type { City, Faq, FlatPage, Location, NewsArticle, Poi } from './schema'

/** Slugs of every published flat page, for generateStaticParams. */
export function getPageSlugs(): readonly string[] {
  return pages.filter((page) => page.published).map((page) => page.slug)
}
