import type { z } from 'zod'

import citiesJson from '@content/cities.json'
import faqsJson from '@content/faqs.json'
import locationsJson from '@content/locations.json'

import {
  CitiesFileSchema,
  FaqsFileSchema,
  LocationsFileSchema,
  type City,
  type Faq,
  type Location,
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

export type { City, Faq, Location } from './schema'
