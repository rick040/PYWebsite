# Content

Phase 1 mock content. Typed JSON, no CMS, no database.

Every file here is validated at module load against the schemas in
`src/lib/content/schema.ts`, which mirror `docs/CONTENT-MODEL.md` field for field. A malformed
file fails the build with the offending path named. In Phase 2 the same shapes come out of Payload
instead and the templates do not change; only the loader behind them does.

```
npm run content:validate
```

reports the record counts and lists every open `{{TODO-NL: ...}}` marker.

## Rules

- **No lorem ipsum.** All Dutch copy here is real, taken from the August 2026 SEO texts written
  against the live parkingyou.nl pages (`docs/data/locations-live-2026-08.csv`).
- **Unknown facts are marked, never invented.** `{{TODO-NL: what is missing}}`, greppable, and
  rendered on the page as-is so a gap is visible rather than quietly plausible.
- **Money is integer cents.** `1250` is € 12,50. Never a float, never a string.
- **`sync` is machine-owned.** Everything under it is written by the Aeroparker sync in Phase 3
  and is read-only to a human. Everything outside it is editor-owned and never written by a
  machine. That split is the whole content model.

## What is real and what is not

| | Status |
| --- | --- |
| Dutch copy, H1, title tags, meta descriptions, FAQ, alt texts | Real, from the live pages |
| Tariffs, capacity, opening hours, clearance heights | Real, from the live pages |
| Addresses | Real street and number where the source had one, `{{TODO-NL}}` where it did not. No postcode was published on any source page |
| Photography | **Placeholder.** Generated, brand-coloured, labelled "PLAATSHOUDER" and `{{TODO-NL: echte foto aanleveren}}`. The alt text is real |
| Coordinates | **Approximate**, flagged per record as `coordinatesSource: "approximate"`. Phase 3 replaces them with Aeroparker's `CarPark` latitude and longitude, which is the authoritative source |
| `bookingUrl` | The real Aeroparker shop root, `https://reserveren.parkingyou.nl/`. Not yet a deep link: the per-quote `BookingURL` contract lands in Phase 3 and is documented in `docs/BOOKING-LINKS.md` |
| `sync.syncedAt`, `sync.status` | Fabricated placeholders so the last-known-good rendering paths can be exercised before the sync exists |

## Files

- `cities.json` — 14 cities, every city ParkingYou operates in.
- `locations.json` — all 46 published locations, migrated from the August 2026 export.
- `faqs.json` — 189 records, flat, so the same answer can appear on a location page, a city page
  and the general FAQ without being written three times.
- `poi.json` — 4 POI landing pages: The Harbour Club, Philips Stadion, Artis, Diergaarde Blijdorp.
- `news.json` — 2 articles.
- `pages.json` — the flat pages: abonnementen, aanvragen, ParkingPass, zakelijk, over ons, contact.

## Two tiers of location

**Three reference locations** (Philips Stadion, Hofplein, Cruquius) are fully populated: address,
tariffs, opening hours, clearance heights, accessibility, coordinates. They were picked because
all three carry `—` in the source export's "needs checking" column, so their source data is
internally consistent.

**The other 43** have their real Dutch copy, H1, title tag, meta description, four FAQs and two
alt texts, but not yet their structured facts. The schema marks those fields optional and each
block renders only when it has content, so a page is never half a table. Phase 2 makes them
required before a location can be published.

30 of the 46 carry an `editorialNote`: a contradictory tariff, an old brand name in the title, a
missing fact. Never shown to a visitor; Phase 2 surfaces it in the Payload admin.

## How it was generated

`scripts/gen/extract.py` parses the export, `scripts/gen/assemble.py` merges in the hand-built
reference data, `scripts/gen/placeholders.py` renders the images. None of the three runs at build
time; they are kept so the migration is reproducible and reviewable.
