# Source data

Provenance for the Phase 0 documents. These files are inputs, not deliverables.

## `locations-live-2026-08.csv`

The 46 published location pages on parkingyou.nl, with their live URL, CMS id, city and the Dutch
SEO copy written for each one, dated 13 August 2026 and made against the live pages.

This is the evidence behind the `verified` rows in `../URL-INVENTORY.csv`: the location URLs and
ids in that inventory are read from this export, not guessed.

It is also the content source for Phase 1. The brief requires real copy and no lorem ipsum, and
this file already contains a title tag, meta description, H1, H2 structure, body text, two alt
texts and four FAQ questions per location.

Two caveats carried over from the export's own notes:

- Five title tags still reference the old brand **voordeligparkeren.nl**: TD-gebouw, Bos en
  Lommerplantsoen, Onyx, Philips Bedrijfsschool, At the Park.
- Thirty of the 46 locations have incomplete or self-contradictory source data. Three price
  promises contradict the tariff table on the same page. Where a figure was contradictory the copy
  omits it rather than repeating it. Those gaps become `{{TODO-NL: ...}}` markers in Phase 1.

## Not in this repository

The AeroParker API Technical Specification v1.42 (draft, 30 July 2025) is a 210-page vendor PDF
held in Google Drive. It is not committed here. `../AEROPARKER-AUDIT.md` cites it by page number.
