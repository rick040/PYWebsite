# Content model

Status: Phase 0 proposal. Implemented in Payload CMS 3 on Postgres in Phase 2.

The rule that governs every field in this document:

> **If a business user needs to change it, they own it. If Aeroparker is the system of record for
> it, they may look at it and never edit it.**

Read-only fields are rendered in the admin as disabled inputs with Dutch help text explaining
where the value comes from and when it was last synced, so that "why can't I change this price?"
answers itself.

Admin field labels and help text are **Dutch**. Field names in code are **English**. Both, always.

## 1. Collections at a glance

| Collection | Dutch admin label | Rows | Who creates them |
| --- | --- | --- | --- |
| `cities` | Steden | 14 | Admin |
| `locations` | Locaties | 46 | Editor |
| `poiPages` | POI-pagina's | grows | Editor |
| `faqs` | Veelgestelde vragen | grows | Editor |
| `news` | Nieuws | grows | Editor |
| `subscriptions` | Abonnementen | few | Admin |
| `pages` | Losse pagina's | ~8 | Admin |
| `media` | Media | grows | Editor |
| `redirects` | Redirects | 249+ | Admin |
| `aeroparkerProducts` | Aeroparker-producten | synced | **Nobody. Written by the sync.** |
| `aeroparkerTariffs` | Aeroparker-tarieven | synced | **Nobody. Written by the sync.** |
| `syncRuns` | Synchronisaties | synced | **Nobody. Written by the sync.** |

Globals: `siteSettings` (Site-instellingen), `navigation` (Navigatie), `footer` (Footer).

## 2. `cities` — Steden

One row per city. URL: `/parkeren/{slug}`.

| Field | Type | Dutch label | Editable | Notes |
| --- | --- | --- | --- | --- |
| `name` | text, required | Naam | Editor | "Eindhoven" |
| `slug` | text, required, unique | URL | Editor | Locked after first publish; changing it writes a redirect |
| `intro` | richText | Introtekst | Editor | Two or three paragraphs, plain spoken Dutch |
| `heroImage` | upload → media | Hoofdfoto | Editor | |
| `centerPoint` | point | Middelpunt | Editor | Used to centre the map and to compute walking distances |
| `seoTitle` | text, max 60 | SEO-titel | Editor | Character counter in the admin |
| `seoDescription` | textarea, max 160 | SEO-omschrijving | Editor | |
| `faqs` | relationship → faqs, hasMany | Veelgestelde vragen | Editor | City-level FAQ block |
| `published` | checkbox | Gepubliceerd | Editor | |

Derived, never stored: the list of locations in a city (query on `locations.city`), and the
"vanaf" price (lowest live tariff across those locations).

## 3. `locations` — Locaties

The reference collection. URL: `/parkeren/{city.slug}/{slug}`.

### Editable by a business user

| Field | Type | Dutch label | Notes |
| --- | --- | --- | --- |
| `name` | text, required | Naam | "Parking Philips Stadion" |
| `slug` | text, required | URL-deel | Unique within the city. Locked after publish; a change writes a redirect |
| `city` | relationship → cities, required | Stad | Drives the URL and the breadcrumb |
| `shortDescription` | textarea, required | Korte omschrijving | One sentence, used on cards and in meta |
| `body` | richText | Omschrijving | The main copy |
| `address` | group | Adres | `street`, `houseNumber`, `postalCode`, `city` |
| `coordinates` | point, required | Coördinaten | Editor may override the Aeroparker value; see section 9 |
| `photos` | upload → media, hasMany, min 1 | Foto's | Alt text is required on every image |
| `routeDescription` | richText | Route en bereikbaarheid | How to drive there |
| `entryInstructions` | richText, required | Inrijden | What to do at the barrier |
| `exitInstructions` | richText, required | Uitrijden | |
| `openingHours` | array | Openingstijden | `day`, `opensAt`, `closesAt`, `closed` |
| `accessibility` | group | Toegankelijkheid | `maxHeight`, `hasElevator`, `wheelchairAccessible`, `evCharging`, `bicycleParking` |
| `walkingDistanceToCenter` | number | Loopafstand centrum (min) | |
| `features` | array of text | Kenmerken | Bullet list shown under the hero |
| `faqs` | relationship → faqs, hasMany | Veelgestelde vragen | |
| `relatedLocations` | relationship → locations, hasMany | Gerelateerde locaties | Optional; siblings are otherwise automatic |
| `subscriptionOnly` | checkbox | Alleen voor abonnees | 18 of 46 locations today. Hides the hourly-tariff block and swaps the CTA |
| `seoTitle` / `seoDescription` | text / textarea | SEO-titel / SEO-omschrijving | |
| `published` | checkbox | Gepubliceerd | |

### The join to Aeroparker

| Field | Type | Dutch label | Editable | Notes |
| --- | --- | --- | --- | --- |
| `aeroparkerCarParkId` | number, required | Aeroparker car park ID | **Admin only** | The single join key. Not visible to editors |

### Read-only, written by the nightly sync

| Field | Type | Dutch label | Source |
| --- | --- | --- | --- |
| `syncedProducts` | join → aeroparkerProducts | Producten uit Aeroparker | `ParkingProductsRQ` |
| `syncedCoordinates` | point | Coördinaten volgens Aeroparker | `CarPark/@Latitude`, `@Longitude` |
| `syncedName` | text | Naam volgens Aeroparker | `CarPark/@Name` |
| `lowestPrice` | number (cents) | Vanafprijs | `ParkingProductPricingRQ` with `SummaryOnly` |
| `syncStatus` | select | Synchronisatiestatus | `ok` / `stale` / `superseded` / `error` |
| `syncedAt` | date | Laatst gesynchroniseerd | |
| `syncMessage` | textarea | Melding | Dutch explanation shown to the editor when status is not `ok` |

**`syncStatus` is the visible safety net.** When a product ID is superseded (see
`AEROPARKER-AUDIT.md` §5.1), the location shows a red banner in the admin saying, in Dutch, that a
product has disappeared from Aeroparker and that the tariffs shown are the last known good ones.
The public page keeps rendering with the last known good data. It never shows a wrong price and it
never 500s.

## 4. `poiPages` — POI-pagina's

URL: `/parkeren-bij/{city.slug}/{slug}`. All fields editable.

| Field | Type | Dutch label | Notes |
| --- | --- | --- | --- |
| `name` | text, required | Naam bestemming | "Effenaar", "Artis", "Philips Stadion" |
| `slug` | text, required | URL-deel | Unique within the city |
| `city` | relationship → cities, required | Stad | |
| `poiType` | select | Soort bestemming | Restaurant, museum, stadion, theater, winkelgebied, evenement, ziekenhuis, overig |
| `coordinates` | point, required | Coördinaten bestemming | Drives the walking-distance ordering |
| `intro` | textarea, required, min 120 chars | Introtekst | **Required, and minimum length enforced.** This is what stops POI pages becoming thin duplicates |
| `body` | richText, required | Omschrijving | About the destination, not about the car park |
| `locations` | relationship → locations, hasMany, **min 1** | Parkeerlocaties | Cannot publish without at least one |
| `heroImage` | upload → media | Hoofdfoto | |
| `faqs` | relationship → faqs, hasMany | Veelgestelde vragen | |
| `seoTitle` / `seoDescription` | text / textarea | SEO-titel / SEO-omschrijving | |
| `published` | checkbox | Gepubliceerd | |

Walking distance from the POI to each linked location is **computed**, not typed, from the two
coordinate pairs. An editor cannot get it wrong and it cannot go stale.

## 5. `faqs` — Veelgestelde vragen

Deliberately a flat, standalone collection so the same answer can appear on a location page, a
city page and the main FAQ without being written three times.

| Field | Type | Dutch label | Notes |
| --- | --- | --- | --- |
| `question` | text, required | Vraag | |
| `answer` | richText, required | Antwoord | |
| `category` | select | Categorie | Reserveren, betalen, abonnementen, ParkingPass, toegang, zakelijk, overig |
| `showOnGeneralFaq` | checkbox | Tonen op /veelgestelde-vragen | |
| `order` | number | Volgorde | |
| `published` | checkbox | Gepubliceerd | |

Every page that renders an FAQ block emits `FAQPage` structured data from the same records
(Phase 4).

## 6. `news` — Nieuws

URL: `/nieuws/{slug}`.

`title`, `slug`, `publishedAt`, `excerpt`, `heroImage` (alt required), `body` (richText),
`relatedLocations`, `relatedCities`, `seoTitle`, `seoDescription`, `published`. All editable.
Emits `NewsArticle` structured data.

## 7. `subscriptions` — Abonnementen

This is where the read-only rule matters most, because **pricing here is Aeroparker's, not ours**.

| Field | Type | Dutch label | Editable | Source |
| --- | --- | --- | --- | --- |
| `name` | text | Naam | Editor | Our display name |
| `slug` | text | URL-deel | Editor | |
| `intro` | richText | Introtekst | Editor | |
| `benefits` | array of text | Voordelen | Editor | |
| `aeroparkerSubscriptionId` | number | Aeroparker subscription ID | **Admin only** | Join key |
| `price` | number (cents) | Prijs | **Read-only** | `SubscriptionAvailabilityRQ` |
| `bookingFee` | number (cents) | Inschrijfkosten | **Read-only** | `BookingFee` |
| `periodType` | select | Periodetype | **Read-only** | `FIXED` / `AUTO_RENEW` |
| `minimumTerm` | text | Minimale looptijd | **Read-only** | `MinimumTerm/Term` |
| `availableAtLocations` | relationship → locations | Beschikbaar op locaties | **Read-only** | `SubscriptionQuote/CarParks` mapped via `aeroparkerCarParkId` |
| `syncStatus` / `syncedAt` | select / date | Synchronisatiestatus / Laatst gesynchroniseerd | **Read-only** | |

An editor writes the story. Aeroparker owns the number. If those two ever disagree, the number
wins and the admin says so.

## 8. Supporting collections

**`pages`** — the handful of flat pages (`/zakelijk`, `/over-ons`, `/contact`, `/parkingpass`,
`/parkeeroplossingen`, `/werken-bij`, `/algemene-voorwaarden`, `/privacy`). Slug, title, a blocks
field (text, image, CTA, FAQ block, location grid, contact form), SEO fields. Admin only, because
these define the site skeleton.

**`media`** — uploads to EU S3-compatible storage. **`alt` is required**; an image cannot be saved
without Dutch alt text. Fields: `alt`, `caption`, `credit`. Sizes generated for AVIF and WebP.

**`redirects`** — `from`, `to`, `statusCode` (default 301), `note`. Seeded from
`URL-INVENTORY.csv`. Also written automatically by the slug-change hook, so an editor renaming a
location never silently breaks an inbound link.

**`aeroparkerProducts`**, **`aeroparkerTariffs`**, **`syncRuns`** — the sync's own tables. No
editor ever opens them. `syncRuns` records started/finished, per-endpoint outcome, counts of
created, updated and superseded records, and the raw error payload when validation failed, so a
failed sync can be diagnosed without shell access.

## 9. Conflict rule: Aeroparker versus the editor

Two fields exist in both worlds: the car park's name and its coordinates.

- **Aeroparker's values are stored** in `syncedName` and `syncedCoordinates`, always.
- **The editor's values are what render.** `name` and `coordinates` on the location are the
  published truth, because Aeroparker's car park names are operational ("Bedrijfsschool Gebouw",
  "BSG") and its coordinates point at the barrier rather than at the entrance a driver needs.
- **When they diverge, the admin says so**, in Dutch, next to the field: "Aeroparker noemt deze
  locatie 'Bedrijfsschool Gebouw'." The editor decides. Nothing is overwritten.

Tariffs have no such rule. Tariffs are Aeroparker's, full stop.

## 10. Roles

| | Editor (Redacteur) | Admin (Beheerder) |
| --- | --- | --- |
| Locations, POI pages, FAQ, news | Create, edit, publish | Same |
| Cities | Edit copy and SEO | Full, including create and slug |
| Subscriptions | Edit copy | Full |
| `pages`, navigation, footer, site settings | Read | Full |
| `aeroparkerCarParkId` and other join keys | Hidden | Visible, editable |
| Redirects | Read | Full |
| Sync tables | Hidden | Read-only |
| Users | No access | Full |

The Phase 2 acceptance test is run **as an editor**, not as an admin, because the requirement is
that a non-technical business user can do it alone.

## 11. Publishing and revalidation

Every content collection has draft and published states with versioning, so an editor can save
work without it going live and can roll back a bad edit.

On publish, an `afterChange` hook revalidates **exactly the affected paths plus their parents**:

| Published | Revalidated |
| --- | --- |
| Location | its own path, its city, its linked POI pages, `/locaties`, `/sitemap.xml` |
| POI page | its own path, its city, each linked location |
| City | its own path, each of its locations, `/locaties`, `/` |
| FAQ | every page that renders it, resolved through the relationship |
| News article | its own path, `/nieuws`, `/` |

Nothing else. No blanket revalidation, because a full purge on every FAQ tweak throws away the
cache that the Core Web Vitals budget depends on.

The 60-second requirement is met because on-demand revalidation writes a new cache entry on the
next request; it needs no build and no deployment.

## 12. Open questions

1. **46 or 37 locations?** The live site publishes 46 location pages; the brief says 37. Probably
   operated car parks versus published pages. Decides how many records we seed.
2. **Is `CarPark/@ID` stable** across Aeroparker product changes? `aeroparkerCarParkId` is the
   join key for the entire model; if it is not stable, the model needs a different key.
3. **Does D2 (see `IA.md`) make every text field translatable?** If `/en/` survives, that is a
   structural change to every collection and has to land in Phase 2, not later.
4. **Who owns tariff corrections?** When the Aeroparker tariff is wrong, the fix belongs in
   Aeroparker. Confirm that the business accepts this and does not expect a CMS override, because
   an override field would quietly become the place where prices go stale.
