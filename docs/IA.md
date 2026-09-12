# Information architecture and URL structure

Status: Phase 0, approved. Nothing here is built yet. The two open decisions (D1, D2) were
answered on 12 September 2026 and this document reflects those answers.

Language rule, applied without exception: code and documentation in English, every URL path, slug,
label and piece of copy in Dutch.

## 1. What the current site does, and why it has to change

Reconstructed from the August 2026 SEO export of all 46 live location pages and from
search-engine results. See `URL-INVENTORY.csv` for the row-by-row detail and per-row confidence.

The live structure is:

```
/nl/                                              home
/nl/locaties                                      all locations
/nl/locaties/amsterdam                            city, bare slug
/nl/locaties/amsterdam/cid=1                      city, with id
/nl/locaties/parking-philips-stadion/id=7         location, flat
/nl/locaties/eindhoven/parking-philips-stadion/id=7   location, nested
/en/...                                           a full English mirror of all of the above
```

Five structural problems, each of which costs traffic today:

1. **Every location is reachable at two paths**, flat and city-nested, and both are indexed. Every
   location page competes with itself.
2. **Every city is reachable at two paths**, with and without `cid=`.
3. **`id=7` is not a path segment**, it is a pseudo-parameter glued on with a slash. It carries no
   meaning for a reader or for a search engine, and it leaks the CMS primary key into the URL.
4. **Cities and regions are mixed in one namespace.** Dordrecht, Den Haag, Rijswijk and Schiedam
   all sit under `regio-zuid-holland`, so there is no page that can rank for "parkeren Dordrecht".
   Amsterdam, Eindhoven and Rotterdam get their own city pages. The taxonomy is inconsistent.
5. **A full English mirror doubles the index** for a business whose customers, locations, payment
   flow and customer service are all Dutch.

Two content problems from the same export, which the new IA has to fix rather than inherit:

- Five title tags still say **voordeligparkeren.nl**, an old brand: TD-gebouw, Bos en
  Lommerplantsoen, Onyx, Philips Bedrijfsschool, At the Park.
- **Location pages link to nothing.** There is no internal linking between locations, no link from
  a city to its locations, no link back up. Every location page is an orphan hanging off a list.

## 2. Proposed structure

Dutch is the default locale and carries no prefix. English is a full hreflang counterpart under
`/en`, with **Dutch slugs in both locales** (decision D2, and the language rule: URL paths and
slugs are Dutch without exception). So `/parkeren/eindhoven/philips-stadion` and
`/en/parkeren/eindhoven/philips-stadion` are the same document in two locales, not two documents.

```
/                                     home
/locaties                             all 46 locations, filterable, the hub
/parkeren/{stad}                      city page            e.g. /parkeren/eindhoven
/parkeren/{stad}/{locatie}            location page        e.g. /parkeren/eindhoven/philips-stadion
/parkeren-bij/{stad}/{poi}            POI landing page     e.g. /parkeren-bij/eindhoven/effenaar
/abonnementen                         subscriptions
/abonnementen/aanvragen               subscription request form
/parkingpass                          ParkingPass
/zakelijk                             business offering
/veelgestelde-vragen                  FAQ
/nieuws                               news overview
/nieuws/{slug}                        news article
/over-ons                             about
/contact                              contact
/parkeeroplossingen                   parking solutions overview
/werken-bij                           jobs
/algemene-voorwaarden                 terms
/privacy                              privacy statement
/nieuwsbrief                          newsletter signup

/en/...                               the same tree, English copy, Dutch slugs
```

Rules that make this hold together:

- **One canonical URL per page.** No `id=`, no `cid=`, no duplicate flat and nested forms. Every
  other historical form 301s to the canonical.
- **Two separate namespaces.** `/parkeren/` is where you can park. `/parkeren-bij/` is why you are
  parking. They never collide, and a POI page can never be mistaken for a car park.
- **Every city is a city.** Dordrecht gets `/parkeren/dordrecht` even though it has one car park.
  `regio-zuid-holland` and `regio-gelderland` disappear as page types; a visitor searching
  "parkeren Dordrecht" gets a page about Dordrecht.
- **Slugs read like Dutch, not like database rows.** `parking-heerhugowaard-p1-zuidtangent-` with
  its trailing dash becomes `/parkeren/heerhugowaard/p1-zuidtangent`.
- **No trailing slashes, lowercase, hyphens.** Enforced by middleware, with a 301 to the canonical
  form so a mistyped link never returns a 404 or a soft duplicate.

### Decision D1 (answered: restructure)

The conservative alternative was to keep today's wording and only strip the noise:
`/nl/locaties/parking-philips-stadion/id=7` becomes `/locaties/parking-philips-stadion`.

**Restructuring was chosen**, for one reason: *every URL on the site changes regardless*. The
`/nl/` prefix and the `id=` suffix both have to go, so there is no version of this project where
the old URLs survive untouched. Once every URL is being redirected anyway, the marginal risk of
also improving the path is small, and the gain is a hierarchy that can actually rank for
"parkeren {stad}". Doing it in two steps would mean two rounds of redirects and two rounds of
ranking turbulence instead of one.

The risk is real and I am not going to pretend otherwise: a large-scale URL change costs ranking
stability for roughly four to eight weeks even when the redirects are perfect. The mitigations are
in section 6.

### Decision D2 (answered: keep English as a real hreflang pair)

The English tree survives. `/en/` is a proper locale, not a redirect. Three consequences, all of
which land in Phase 2 rather than being retrofitted later:

1. **Every text field in every collection becomes localised.** Slugs, coordinates, relationships
   and everything written by the Aeroparker sync stay single-valued. See `CONTENT-MODEL.md` §13.
2. **Publication state is per locale.** A page goes live in Dutch first; its English version only
   becomes reachable when someone has actually translated it. An untranslated `/en/` URL returns
   404 and emits no hreflang, because a half-Dutch English page is worse for both languages than
   no English page at all.
3. **hreflang is emitted as a reciprocal set** on every page that exists in both locales:
   `nl-NL` → the Dutch URL, `en` → the `/en` URL, `x-default` → the Dutch URL.

The ongoing cost is editorial, not technical: every new location and POI page is now two pieces of
writing. That is the trade accepted in exchange for keeping the English traffic.

The Search Console baseline described in section 6 should still be taken per locale, so the
English tree's performance after cutover can be judged on its own numbers.

## 3. The three page types that carry the SEO

### City page, `/parkeren/{stad}`

Answers "waar kan ik parkeren in {stad}". Contains: a short intro in the city's own terms, a map
with all locations in that city, a card per location with its "vanaf" price and walking distance
to the centre, the POI pages for that city, and a city-level FAQ.

Fourteen cities: Almere, Amsterdam, Den Haag, Dordrecht, Ede, Eindhoven, Heerhugowaard, Nijmegen,
Rijswijk, Rotterdam, Schiedam, Tilburg, Utrecht, Zoetermeer.

### Location page, `/parkeren/{stad}/{locatie}`

The reference template and the page that gets the most care. It answers the questions a driver has
in the ten minutes before they drive somewhere: what does it cost, how do I get in, how do I get
out, how far is it to where I am going, and can I book it now.

Blocks, in order: photography, one-line summary with address and "vanaf" price, prominent booking
CTA, tariffs, route and access, entry and exit instructions, opening hours, map, nearby POIs, FAQ,
related locations in the same city.

Forty-six locations today. Note the discrepancy with the brief's "37 locations": the live site
publishes 46 location pages. The likely explanation is 37 operated car parks versus 46 published
pages, some subscription-only. **This needs confirming before Phase 1 content work**, because it
decides how many location records we seed.

### POI landing page, `/parkeren-bij/{stad}/{poi}`

"Parkeren bij restaurant X", "parkeren bij het Philips Stadion", "parkeren bij Artis". This is the
page type that wins long-tail intent, and the one the business user will create most often.

It is a page about the *destination*, not about the car park: how to get there, what is on nearby,
and then one to three ParkingYou locations ranked by walking distance, each with its price and a
booking CTA. It must never be a thin duplicate of a location page, so the content model forces the
editor to write destination-specific copy and the template refuses to publish without it.

The existing product list already shows the demand: GLOW, Champions League, Marathon, Eredivisie,
Artis, Zomercarnaval and Pathé products all exist in Aeroparker. Those are POI and event pages
waiting to be written.

## 4. Internal linking

The rule: **no orphans, and every link is generated from a relationship, not typed by hand.** Hand
-typed internal links rot the moment a slug changes.

```
home ─────────────► /locaties ──────────► city ──────────► location
                                            ▲    ▲            │
                                            │    └────────────┘   location links back to its city
                                            │                     and sideways to siblings
                                            │
                                    POI ────┘   POI links up to its city
                                     ▲          and across to its nearest locations
                                     └──────────── location links down to its POIs
```

Concretely:

| From | To | How it is generated |
| --- | --- | --- |
| Home | 14 city pages, top locations | Query, not a hand-built menu |
| `/locaties` | All 46 locations, grouped by city | Query |
| City | Its locations, its POI pages, neighbouring cities | Relationship on the location and POI records |
| Location | Its city (breadcrumb), POIs within walking distance, 3 sibling locations in the same city | `location.city`, `poi.locations[]` reversed, `city.locations` minus self |
| POI | Its city, 1 to 3 nearest locations | `poi.city`, `poi.locations[]` ordered by walking distance |
| News article | Locations and cities it mentions | Optional relationship fields on the article |

Breadcrumbs mirror the path exactly, so `BreadcrumbList` structured data in Phase 4 is generated
from the same tree rather than assembled separately:
`Home > Parkeren > Eindhoven > Philips Stadion`.

Two guards, both enforced by test in Phase 4:

- A published location with zero inbound links from a city page fails the build.
- A published POI page with zero linked locations cannot be published; the admin blocks it.

## 5. What we deliberately do not build here

- **The PWA.** Separate project. The design tokens are shared (Phase 1); the code is not.
- **A booking funnel.** Every booking CTA deep links into Aeroparker. We never take a booking.
- **A customer account area.** That is Aeroparker's and the PWA's.
- **The FAQ on Zendesk.** Today the FAQ lives at `parkingyou.zendesk.com`. The brief requires an
  FAQ a business user edits in our admin, so `/veelgestelde-vragen` is a new page in this site.
  Zendesk stays as the customer-service helpdesk; it stops being the public FAQ. This is a new
  page and not a redirect target, so it appears in `URL-INVENTORY.csv` only as a note.

## 6. Protecting the rankings through the cutover

The single biggest risk in this project, handled in Phase 4 but decided here.

1. **Every old URL 301s in exactly one hop.** No chains. The test asserted in Phase 4 walks every
   row of `URL-INVENTORY.csv` and fails the build on a 404, a 302, a redirect chain longer than
   one, or a final status other than 200.
2. **The redirect map is data, not code.** It is generated from `URL-INVENTORY.csv`, so adding a
   row is a content change and not a deployment.
3. **Canonical tags point at the new canonical from day one.**
4. **The inventory is completed from Search Console before go-live.** See section 7: the version in
   this repository is built from an export and from search results, not from a crawl, and the
   pattern rows for news articles and subscription pages still need their real IDs enumerated.
5. **Submit the new sitemap on cutover day and keep the old one reachable** until Google has
   recrawled, so the redirects are discovered rather than waited for.
6. **Measure, do not assume.** Baseline impressions and clicks per URL before cutover; compare
   weekly for eight weeks after.

## 7. Honest limits of this document

The live parkingyou.nl site **could not be crawled from this environment**. Outbound HTTPS to
`parkingyou.nl` is refused by the egress proxy (`403 connect_rejected`), as is `web.archive.org`.

So the structure above is reconstructed from:

- **Verified** (101 rows): 46 location URLs with their IDs and cities, from the August 2026 SEO
  export made against the live pages; roughly 30 further URLs seen directly in search-engine
  results.
- **Pattern-derived** (154 rows): most `/en/` counterparts, the city-nested location forms, and
  the region mapping for cities the search results did not cover. Every such row is marked
  `pattern` in `URL-INVENTORY.csv`.
- **New pages** (14 rows): city pages for the cities the live site folded into a region.

**Before the redirect map goes live, somebody with Search Console access has to export the full
list of indexed URLs and reconcile it against this inventory.** The structure will hold; the row
count will grow. Three pattern rows in particular are placeholders with no real IDs behind them
yet: news articles, `abonnementen/subscription={id}` and `abonnementen/location={id}`.

I would rather say that plainly than present 269 rows as a finished crawl.
