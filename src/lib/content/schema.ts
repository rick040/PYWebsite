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

const Coordinates = z.object({
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
  centerPoint: Coordinates,
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
  coordinates: Coordinates,
  /**
   * Where the coordinates came from. "approximate" means a human placed them
   * roughly and they have not been checked on the ground; the Phase 3 sync
   * replaces them with Aeroparker's CarPark latitude and longitude, and an
   * editor may then override that per docs/CONTENT-MODEL.md 9.
   */
  coordinatesSource: z.enum(['approximate', 'verified', 'aeroparker']),

  photos: z.array(Photo).min(1),

  routeDescription: z.array(z.string().min(1)).min(1),
  entryInstructions: z.array(z.string().min(1)).min(1),
  exitInstructions: z.array(z.string().min(1)).min(1),
  openingHours: z.array(OpeningHours).length(7),
  accessibility: Accessibility,

  capacity: z.number().int().positive().optional(),
  walkingDistanceToCenterMinutes: z.number().int().positive().optional(),
  features: z.array(z.string().min(1)).default([]),

  tariffs: z.array(TariffGroup).default([]),
  /** Aeroparker deep link. The contract is documented in Phase 3. */
  bookingUrl: z.string().url(),

  subscriptionOnly: z.boolean().default(false),
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
