# Aeroparker API audit

Status: Phase 0 deliverable. Written against **AeroParker API Technical Specification v1.42
(draft, 30 July 2025)**, 210 pages, plus an August 2026 export of ParkingYou's own Aeroparker
product list.

Aeroparker is and stays the system of record for bookings, products, inventory and pricing.
This codebase **reads from it and deep links into it, and never writes to it.** Every write
method listed below is documented here only so that nobody accidentally reaches for one.

## 1. Source material and its limits

| Input | What it is | Where it came from |
| --- | --- | --- |
| `AeroParker API Technical Specification v.1.42 Draft.pdf` | The full XML/JSON API contract | Google Drive, folder "Parking You" |
| `Locaties` spreadsheet | Export of ParkingYou's Aeroparker ProductManager, 87 product rows across 18 car parks | Google Drive |

Two things the specification does **not** contain, and which we therefore cannot state as fact:

- **No base URL for the v1 endpoint.** The spec says only "all requests are sent to the same
  URL". The one concrete path it gives is the Cognito v2 form, `/API/v2/{affiliate-code}/HTTPService`.
  Hosts seen in examples are `api.aeroparker.com` (production) and `sim.aeroparker.com`
  (simulator). ParkingYou's own tenant runs at `reserveren.parkingyou.nl`.
- **No rate limits, no quotas, no caching guidance, no SLA.** The words "rate limit", "throttle",
  "requests per", "concurrent" and "timeout" do not appear anywhere in 210 pages.

Both are open questions for Aeroparker, listed in section 8.

## 2. Transport and authentication

- Plain HTTP `POST` of an XML document; the response is an XML document. Namespace
  `http://api.aeroparker.com`. Different actions are selected by the root element name
  (`ParkingAvailabilityRQ`, `ParkingProductsRQ`, ...), not by path.
- **JSON is supported for `ParkingProductPricingRQ` only.** Every other method is XML.
- The API is **stateless**. There is no session token; authentication happens on every request.

Three authentication modes:

| Mode | How | Notes |
| --- | --- | --- |
| Credentials element | `<Credentials><Username/><Password/></Credentials>` in the request body | The default in the spec |
| Basic HTTP auth | `Authorization: Basic base64(user:pass)` | Added in v1.21; keeps credentials out of the body |
| AWS Cognito bearer token | `Authorization: Bearer <token>`, URL `/API/v2/{affiliate-code}/HTTPService` | Only if the tenant is on an Aeroparker Cognito user pool |

**Design decision:** use Basic HTTP auth. It keeps the secret out of the request body and out of
logs that capture bodies, and it works with ordinary HTTP client tooling. Credentials live in
environment variables, never in the repository.

**The constraint that shapes the whole integration:** the spec states that *"a set of login
credentials grants access to one airport"*. Aeroparker's model is one credential set per site or
affiliate. ParkingYou runs 14 cities and, per the live site, 46 published location pages. Before
Phase 3 we must establish whether ParkingYou has one credential set covering everything, or one
per site. This changes the sync job from a single loop into a fan-out over N credential sets, so
it is a Phase 3 blocker, not a detail.

## 3. Endpoints we will actually use

All read-only. This is the whole surface the marketing website needs.

| Method | Purpose on the website | Response shape |
| --- | --- | --- |
| `ParkingProductsRQ` | The list of currently **enabled** products. The spine of the nightly sync: it tells us which product IDs still exist. | `ParkingProduct[]` with `@ID`, `@Name`, `Appearance` (Features, Description, Terms, Logo, Map) |
| `ParkingProductPricingRQ` | Tariffs and "vanaf" prices for location pages, without touching a booking flow. Accepts JSON. | Per product: `Pricing[]` with `Price`, `RollupPrice`, `Saving`; plus `TransferDetails` (Type/Time/Description) |
| `ParkingProductPricingRQ` with `SummaryOnly="true"` | `PricingSummary` with `LowestPrice`, `HighestPrice`, `LargestSaving`, `SmallestSaving`. Exactly what a city page needs for "vanaf € X". | One small block instead of a full price grid |
| `ParkingAvailabilityRQ` | Live availability, geo coordinates, and the per-quote `BookingURL` that our CTAs deep link to. | `ParkingProductQuote[]` with `ParkingProduct`, `CarPark` (ID, Name, Latitude, Longitude, MapsPOI), `Price`, `BookingURL` |
| `SubscriptionAvailabilityRQ` | The abonnementen page: products, bullet points, price, `PeriodType` (`FIXED` / `AUTO_RENEW`), `MinimumTerm`, `BookingFee`, and the car parks each subscription covers. | `SubscriptionQuote[]` |
| `ListTerminalsRQ` | Terminal IDs. Airport vocabulary; probably degenerate for ParkingYou (`Terminal` `-1` appears in the live booking URLs) but cheap to verify. | `Terminal[]` |

### Endpoints we will never call

`ParkingBookingNewRQ`, `ParkingBookingAmendRQ`, `ParkingBookingCancelRQ`, all `Ancillary*` booking
methods, all `Subscription*` booking, amend, cancel, refund and renew methods,
`ParkingBarrierUpdateRQ`, `ReservationUpdateRQ`, `CardTokenizationRQ`,
`ResendBookingConfirmationRQ`, `GetCustomerDetailsRQ`, `GenerateOfferPromoCodeRQ`.

`GetCustomerDetailsRQ` and `GetBookingsRQ` are read methods, but they return personal data
(names, addresses, phone numbers, loyalty tiers, masked card numbers). A marketing website has no
lawful purpose for that data, so they are out of scope on privacy grounds, not just scope grounds.

## 4. Data freshness

There is no push, no webhook and no change feed. Everything is pull.

`ParkingProductPricingRS` and `ParkingAvailabilityRS` both carry a `@Timestamp` attribute on the
response root. That is the only freshness signal the API gives, and it describes when Aeroparker
answered, not when the underlying price last changed. We therefore have to decide freshness
ourselves:

- **Products, tariffs, appearance text: nightly.** Prices and product configuration are changed by
  hand in the Aeroparker admin; they do not move minute to minute.
- **Live availability: not on the page at all.** `QuotaCapacity` and `BucketCapacity` are real-time
  numbers. Rendering them from a nightly snapshot would show a stale "12 plekken vrij". Either we
  fetch them client-side at request time with a hard timeout and degrade silently, or we do not
  show them. Phase 3 decision; the safe default is not to show them.
- **Every synced record is stored with `synced_at`.** A record older than 48 hours is flagged in
  the admin, because a silently frozen sync is worse than a loud one.

## 5. Known failure modes, and the design that survives them

### 5.1 Superseded product IDs

This is not hypothetical. ParkingYou's own product list shows exactly how products die:

```
DLL Garage - Guus - Copy          | DLL Garage | Published: Ja | Activated: Ja
xxxDLL Garage - Guus              | DLL Garage | Published: Ja | Activated: Nee
xxxFEL Beursgebouw Parking        | Fellenoord | Published: Ja | Activated: Nee
xxxRTMB - Marathon Rotterdam-archived
BSG GLOW Evening Parking - Copy   | Bedrijfsschool Gebouw | Published: Nee | Activated: Nee
```

The working pattern in the Aeroparker admin is: duplicate a product, edit the copy, prefix the
old one with `xxx`, deactivate it. The old product keeps its ID and stays "Published", but it is
no longer activated and will not appear in `ParkingProductsRS`. Note also that `Published` and
`Geactiveerd` are two independent flags, and `xxx...-archived-archived` shows the convention
being applied twice to the same record.

Consequence: **any product ID hardcoded in this codebase or stored in the CMS will eventually
point at a product that no longer exists**, silently, with no notification.

The design:

1. Nothing in the CMS stores a bare product ID as content. A location record holds an
   `aeroparkerCarParkId`, and the products hanging off it are rows written by the sync, never
   typed by a human.
2. Every sync run diffs the returned ID set against the stored ID set. An ID that disappears is
   marked `superseded`, **not deleted**.
3. A superseded product keeps its last known good tariff data and stops being rendered. The
   location page renders from its remaining live products.
4. If a location ends up with zero live products, the page still renders, with the tariff block
   replaced by a pointer to the booking flow. **A broken product ID must never take a location
   page down and must never show a wrong price.** This is enforced by test, not by hope.
5. The mismatch surfaces in the Payload admin as a flag on the location, and fires an alert.

### 5.2 `ParkingProductId` filtering

`AvailabilityWindow/ParkingProductId` filters an availability request to one product.
`ParkingProductPricingRQ/Products` takes a space-separated list of IDs and, per the spec, *"if not
included, pricings for all parking products associated with the affiliate will be returned"*.

Two traps:

- **A filter for a product that no longer exists does not error.** It returns an empty or partial
  result. Combined with 5.1 this is the classic silent failure: the page renders, the tariff block
  is empty, nobody notices for a month. Our client treats "filtered request returned zero
  products" as an error condition to be logged and alerted, not as an empty list.
- **The unfiltered call is the safer one.** Ask for everything the affiliate has, then match on
  our side against the car park ID. That removes a whole class of bug at the cost of a larger
  nightly response, which is irrelevant in a nightly batch job.

Also, per the spec, `Durations` values over 365 days are *ignored* rather than rejected, and if
both `EntryDateTime` and `LeadTime` are sent, `EntryDateTime` wins. Silent precedence rules like
these are why every response gets zod-validated in Phase 3.

### 5.3 Errors arrive inside a 200-shaped response

Errors are **not** HTTP status codes. The response is the expected type, stripped of its optional
elements, with an `<Error Code="..." Message="..."/>` element inside it:

```xml
<ParkingAvailabilityRS Timestamp="2015-10-06T12:51:33.289+01:00">
  <Error Code="9" Message="The arrival date/time is in the past" />
</ParkingAvailabilityRS>
```

A client that only checks the HTTP status will read this as a successful response containing no
products. The zod schema for every response therefore treats `Error` as a first-class branch.

Codes that matter to a read-only integration:

| Code | Meaning | What we do |
| --- | --- | --- |
| 101 | Invalid credentials | Fail the sync loudly, alert, keep last known good |
| 102 | Invalid request | Bug on our side; fail the build or the job, never degrade |
| 103 | Invalid data | Same |
| 104 | Invalid required element | Same |
| 109 | Invalid availability window | Our date handling is wrong; log the window we sent |
| 201 | Product not available | Expected for a window with no availability; not an error |
| 202 | Product quote invalid | Stale quote; discard |
| 900 | Not yet supported | Log once, do not retry |
| 999 | Internal error | Retry with backoff, then keep last known good and alert |

Full list in the spec, pages 191 to 192. Codes 20, 21, 105, 106, 111 to 113, 301 to 316 and 501 to
503 are all booking, payment, passenger or loyalty errors and are unreachable from read-only calls.

### 5.4 Untyped and awkward payloads

- `Description` and `Terms` are `CDATA` blocks containing **HTML**, and in JSON responses they
  arrive HTML-entity-encoded (`"&lt;p&gt;Description&lt;/p&gt;"`). Anything rendered from these
  must be sanitised. Our position: Aeroparker `Description` and `Terms` are reference data for
  editors, not page copy. Page copy is written in the CMS.
- `Price/@Value` is a string in XML and a bare number in JSON (`"Value":15` for € 15.00). Parse to
  integer cents, never to a float.
- `Logo` and `Map` URIs are sometimes absolute (`http://demo.aeroparker.com/...`, note plain HTTP)
  and sometimes site-relative (`/products/logos/102.jpg`). Both forms must be handled, and no
  `http://` asset is ever embedded in a page.
- The spec's own examples contain typos that hint at the underlying serialiser's looseness:
  `CarPark/@Logitude`, `<PriceValue="30.00"/>`, `<PeriodType>Fixed<PeriodType/>`. Validate, do not
  trust.
- Currency in every example is `GBP`. ParkingYou is a euro business. The sync asserts
  `Currency === "EUR"` and refuses to store a record that says otherwise, because a silently
  mis-currencied price is the single most damaging thing this site could publish.

## 6. Booking deep links

`ParkingProductQuote/BookingURL` is returned per quote and is the contract for our CTAs. Live
example from the spec:

```
https://api.aeroparker.com/book/ABZ/Parking
  ?terminalid=-1
  &parkingDetailsSubmitted=1
  &progressToNextStep=1
  &entryDate=10-31-2019      <- MM-DD-YYYY
  &exitDate=01-30-2020
  &entryTime=13:00
  &exitTime=10:00
  &pid=140                   <- parking product id
  &selectProductSubmitted=1
  &apiKey=<uuid>
```

Note `entryDate` is **MM-DD-YYYY**, an American ordering, in a European product. Getting this
wrong turns "3 April" into "no availability on 4 March". It will be a typed, tested formatter.

Preferred approach for Phase 3: **use the `BookingURL` Aeroparker returns rather than building the
URL ourselves**, and only construct one when we need dates the user picked. Aeroparker owns that
contract and can change it; a URL we assembled from parts will break quietly, a URL they handed us
will not. The full contract goes in `docs/BOOKING-LINKS.md` in Phase 3.

`Post Confirmation Redirect` exists and would let Aeroparker bounce a customer back to a
confirmation page on our domain, signed with a hex SHA-512 of
`{api-key}:{reference}:{created}:{car-park}:{shared-secret}`. Out of scope for the marketing site;
noted because it belongs to the PWA project.

## 7. What this means for the architecture

1. **Page rendering never makes a live Aeroparker call.** Nightly sync into Postgres; pages render
   from our own database. A slow or down Aeroparker degrades our freshness, never our uptime or
   our Core Web Vitals.
2. **Last known good is the default, everywhere.** Nothing is deleted on a failed or partial sync.
3. **Failures are loud in logs and in the admin, and silent on the page.** A visitor never sees a
   stack trace or an empty tariff table with no explanation.
4. **Every response is zod-validated at the boundary.** An unexpected shape fails the job with the
   offending payload logged; it never reaches a template.
5. **Aeroparker text is reference data, not page copy.** Editors write the Dutch copy; the sync
   fills in tariffs, coordinates and product availability. This keeps the business user in control
   of what the page says.

## 8. Open questions for Aeroparker

These need answers before Phase 3 can be built rather than guessed at.

1. What is the production base URL for the v1 XML endpoint, and is ParkingYou on v1 or on the v2
   Cognito path?
2. Does ParkingYou have **one** credential set covering all sites, or one per site? If one per
   site, how many, and how are they mapped to car parks?
3. Are there rate limits, and what happens when we exceed them? The spec documents none.
4. Is there a sandbox tenant for ParkingYou, or is `sim.aeroparker.com` the only non-production
   environment?
5. Does `ParkingProductsRQ` return only activated products, or also published-but-deactivated
   ones? Our supersession logic depends on this answer.
6. Is `CarPark/@ID` stable across product changes? It is the join key for the whole content model.
7. What is the intended behaviour of `MapsPOI`, and does it contain a Google Maps identifier we
   would rather not use?

## 9. Verification

- The specification was read directly: 210 pages extracted from the PDF and the endpoint,
  authentication, error-code and data-type sections read in full. Page references above point into
  that document.
- The product-lifecycle claim in 5.1 is taken from ParkingYou's own admin export, not inferred.
- No request has been made to any Aeroparker endpoint. Outbound network access to non-allowlisted
  hosts is blocked in this environment, and we have no credentials. Everything in sections 3 to 6
  is read from the contract; nothing here is claimed to have been executed.
