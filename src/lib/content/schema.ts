import { z } from 'zod'

/**
 * Runtime schemas for the Phase 1 mock content in /content.
 *
 * These mirror docs/CONTENT-MODEL.md field for field. In Phase 2 the same
 * shapes come out of Payload instead of JSON, so the templates do not change:
 * only the loader behind them does.
 *
 * Two conventions, both deliberate:
 *
 * - Money is integer cents. Never a float. A rounding error in a published
 *   tariff is the most damaging thing this site can do.
 * - Anything the nightly Aeroparker sync owns lives under `sync`, separated
 *   from the fields a business user edits. Nothing outside `sync` is ever
 *   written by a machine, and nothing inside it is ever edited by a human.
 */

const Slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, hyphen separated, no trailing dash')

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

const Seo = z.object({
  title: z.string().min(1).max(70),
  description: z.string().min(1).max(180),
})

const Photo = z.object({
  src: z.string().startsWith('/'),
  /** Required. An image without Dutch alt text cannot be published. */
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /**
   * True while real photography is missing. The gallery then renders a labelled
   * placeholder block instead of an <img>, so nobody can mistake a stand-in for
   * a photo of the actual car park, and the repository carries no fake images.
   * Drop the flag and point `src` at the real file when photography arrives.
   */
  placeholder: z.boolean().default(false),
})

/** A heading plus its paragraphs. Mirrors the H2 structure of the source copy. */
const BodySection = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
  /** Renders as a call-out rather than plain prose. Used for "let op" warnings. */
  tone: z.enum(['default', 'warning']).default('default'),
})

const TariffUnit = z.enum([
  'per_30_min',
  'per_hour',
  'per_day',
  'per_month',
  'per_pass',
])
export type TariffUnit = z.infer<typeof TariffUnit>

const TariffRow = z.object({
  /** Dutch label, e.g. "Maandag tot en met vrijdag". */
  label: z.string().min(1),
  amountCents: z.number().int().nonnegative(),
  unit: TariffUnit,
  note: z.string().optional(),
})

const TariffGroup = z.object({
  title: z.string().min(1),
  kind: z.enum(['short_stay', 'day_pass', 'parkingpass', 'subscription']),
  rows: z.array(TariffRow).min(1),
})

const OpeningHours = z.object({
  /** 1 = Monday, 7 = Sunday, matching ISO 8601. */
  day: z.number().int().min(1).max(7),
  closed: z.boolean(),
  opensAt: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/).optional(),
})

const Accessibility = z.object({
  maxHeightMeters: z.number().positive().optional(),
  maxHeightNote: z.string().optional(),
  covered: z.boolean(),
  hasElevator: z.boolean(),
  wheelchairAccessible: z.boolean(),
  cameraSurveillance: z.boolean(),
  evCharging: z.boolean(),
  bicycleParking: z.boolean(),
})

/**
 * Everything the nightly Aeroparker sync owns. Read-only in the admin, and in
 * Phase 1 read-only here too.
 *
 * `status` is the visible safety net described in docs/AEROPARKER-AUDIT.md 5.1.
 * When a product ID is superseded the page keeps rendering from the last known
 * good tariffs and says when they were last confirmed. It never shows a wrong
 * price and it never fails.
 */
const SyncState = z.object({
  status: z.enum(['ok', 'stale', 'superseded', 'error']),
  syncedAt: z.iso.datetime(),
  /** The "vanaf" price. Null when no live product has a price. */
  lowestPriceCents: z.number().int().nonnegative().nullable(),
  /** Dutch explanation shown to an editor when status is not "ok". */
  message: z.string().optional(),
})

export const CitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: Slug,
  intro: z.string().min(1),
  centerPoint: CoordinatesSchema,
  seo: Seo,
  faqIds: z.array(z.string()).default([]),
  published: z.boolean(),
})
export type City = z.infer<typeof CitySchema>

export const FaqSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum([
    'reserveren',
    'betalen',
    'abonnementen',
    'parkingpass',
    'toegang',
    'zakelijk',
    'overig',
  ]),
  showOnGeneralFaq: z.boolean().default(false),
  published: z.boolean(),
})
export type Faq = z.infer<typeof FaqSchema>

export const LocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: Slug,
  cityId: z.string().min(1),

  /**
   * The on-page H1. Separate from seo.title on purpose: the title tag is
   * written for a search result and carries the brand, the H1 is written for
   * someone who has already arrived.
   */
  h1: z.string().min(1),
  shortDescription: z.string().min(1),
  body: z.array(BodySection).min(1),

  address: z.object({
    street: z.string().min(1),
    houseNumber: z.string().min(1),
    postalCode: z.string().min(1),
    city: z.string().min(1),
  }),
  /**
   * Optional until the Phase 3 sync fills it from Aeroparker's CarPark
   * latitude and longitude. The map block renders only when it is present, so
   * a location without coordinates degrades to its address rather than to a
   * broken map.
   */
  coordinates: CoordinatesSchema.optional(),
  /**
   * Where the coordinates came from. "approximate" means a human placed them
   * roughly and they have not been checked on the ground; the Phase 3 sync
   * replaces them with Aeroparker's values, and an editor may then override
   * that per docs/CONTENT-MODEL.md 9.
   */
  coordinatesSource: z.enum(['approximate', 'verified', 'aeroparker']).optional(),

  photos: z.array(Photo).min(1),

  /**
   * The practical blocks. Optional in Phase 1: 43 of the 46 locations have
   * their Dutch copy migrated but not yet their structured facts, and a
   * half-filled table is worse than no table. Each block renders only when it
   * has content. Phase 2 makes them required for a location to be publishable.
   */
  routeDescription: z.array(z.string().min(1)).default([]),
  entryInstructions: z.array(z.string().min(1)).default([]),
  exitInstructions: z.array(z.string().min(1)).default([]),
  openingHours: z.array(OpeningHours).length(7).optional(),
  accessibility: Accessibility.optional(),

  capacity: z.number().int().positive().optional(),
  walkingDistanceToCenterMinutes: z.number().int().positive().optional(),
  features: z.array(z.string().min(1)).default([]),

  tariffs: z.array(TariffGroup).default([]),
  /** Aeroparker deep link. The contract is documented in Phase 3. */
  bookingUrl: z.string().url(),

  subscriptionOnly: z.boolean().default(false),
  /**
   * A note to whoever edits this page, carried over from the content audit:
   * a contradictory tariff, an old brand name in the title, a missing fact.
   * Never rendered to a visitor. Phase 2 surfaces it in the Payload admin.
   */
  editorialNote: z.string().optional(),
  faqIds: z.array(z.string()).default([]),
  seo: Seo,
  published: z.boolean(),

  /** Admin-only join key. Never shown to an editor. */
  aeroparkerCarParkId: z.number().int().positive(),
  sync: SyncState,
})
export type Location = z.infer<typeof LocationSchema>

export const CitiesFileSchema = z.array(CitySchema)
export const LocationsFileSchema = z.array(LocationSchema)
export const FaqsFileSchema = z.array(FaqSchema)

export type Coordinates = z.infer<typeof CoordinatesSchema>

/** A heading with paragraphs, and optionally a bullet list. Used by POI pages,
 *  news articles and the flat pages. */
const ProseSection = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
  bullets: z.array(z.string().min(1)).default([]),
})

export const PoiSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: Slug,
  cityId: z.string().min(1),
  poiType: z.enum([
    'restaurant',
    'museum',
    'stadion',
    'theater',
    'winkelgebied',
    'evenement',
    'ziekenhuis',
    'dierentuin',
    'overig',
  ]),
  coordinates: CoordinatesSchema,
  /**
   * Required, with a minimum length. This is what stops a POI page becoming a
   * thin duplicate of the location page it links to: the editor has to say
   * something about the destination itself.
   */
  intro: z.string().min(120),
  body: z.array(ProseSection).min(1),
  /** At least one. A POI page with nowhere to park is not publishable. */
  locationIds: z.array(z.string().min(1)).min(1),
  faqIds: z.array(z.string()).default([]),
  seo: Seo,
  published: z.boolean(),
})
export type Poi = z.infer<typeof PoiSchema>

export const NewsSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: Slug,
  publishedAt: z.iso.date(),
  excerpt: z.string().min(1),
  body: z.array(ProseSection).min(1),
  relatedCityIds: z.array(z.string()).default([]),
  relatedLocationIds: z.array(z.string()).default([]),
  seo: Seo,
  published: z.boolean(),
})
export type NewsArticle = z.infer<typeof NewsSchema>

export const PageSchema = z.object({
  id: z.string().min(1),
  /** May contain a slash: "abonnementen/aanvragen" is one page, not two. */
  slug: z.string().regex(/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/),
  h1: z.string().min(1),
  intro: z.string().min(1),
  sections: z.array(ProseSection).min(1),
  cta: z.object({ label: z.string().min(1), href: z.string().startsWith('/') }).optional(),
  faqIds: z.array(z.string()).default([]),
  seo: Seo,
  published: z.boolean(),
})
export type FlatPage = z.infer<typeof PageSchema>

export const PoisFileSchema = z.array(PoiSchema)
export const NewsFileSchema = z.array(NewsSchema)
export const PagesFileSchema = z.array(PageSchema)
