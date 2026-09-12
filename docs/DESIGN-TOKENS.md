# Design tokens

One visual language, two products. The marketing website (this repository) and the future PWA
share the tokens and nothing else: no shared component library, no shared framework, no coupling
beyond a list of values.

## Where they live

| File | What it is | Who reads it |
| --- | --- | --- |
| `src/styles/tokens.css` | The source of truth. Plain CSS custom properties, no framework syntax, no build step. | This site, and the PWA by importing it |
| `design-tokens.json` | Generated from the CSS. Every reference resolved to a concrete value. | Anything that cannot import CSS: a native shell, a Figma sync, a React Native theme |
| `src/app/globals.css` | The Tailwind v4 bridge. Maps `--py-*` onto Tailwind's `@theme` namespace. | This site only |

Regenerate the JSON after any change to the CSS:

```
npx tsx scripts/export-tokens.ts
```

Everything is namespaced `--py-*` so that importing `tokens.css` into the PWA cannot collide with
whatever that project already defines.

## Colour

The palette is derived from the real brand asset, not invented. `ParkingYouBase.png` is 69.5 per
cent `#203D8B`, 25 per cent white and 3.3 per cent `#79C9DC`. Those two colours are pinned as
`--py-blue-700` and `--py-cyan-400`; every other step is a perceptually even interpolation in
OKLCH at the same hue, so the scale stays recognisably ParkingYou at every lightness.

| Role | Token | Value |
| --- | --- | --- |
| Brand blue | `--py-blue-700` | `#203d8b` (exact logo blue) |
| Accent cyan | `--py-cyan-400` | `#79c9dc` (exact logo accent) |
| Body text | `--py-color-foreground` | `#24262a` |
| Muted text | `--py-color-foreground-muted` | `#63676e` |
| Functional border | `--py-color-border-interactive` | `#82868e` |
| Focus ring | `--py-color-focus-ring` | `#3c5daf` |

### Measured contrast

Every pairing below was computed, not estimated. WCAG 2.1 AA needs 4.5:1 for body text and 3:1 for
non-text UI.

| Pair | Ratio | Needs | |
| --- | --- | --- | --- |
| Body text on white | 15.15 | 4.5 | pass |
| Muted text on white | 5.68 | 4.5 | pass |
| Muted text on the subtle surface | 5.44 | 4.5 | pass |
| Brand blue link on white | 9.99 | 4.5 | pass |
| White on the primary button | 9.99 | 4.5 | pass |
| White on primary hover (`blue-800`) | 12.66 | 4.5 | pass |
| Brand blue on the brand-subtle surface | 9.23 | 4.5 | pass |
| Focus ring on white | 6.22 | 3.0 | pass |
| Functional border on white | 3.65 | 3.0 | pass |
| Success on white / on its surface | 5.44 / 5.11 | 4.5 | pass |
| Warning on white / on its surface | 5.92 / 5.50 | 4.5 | pass |
| Danger on white / on its surface | 6.56 / 5.99 | 4.5 | pass |
| Body text on cyan-100 | 13.33 | 4.5 | pass |

**The accent cyan is 1.87:1 on white.** It is a background and a decoration, never text on white,
and never the only thing carrying a meaning. That constraint is written into `tokens.css` next to
the scale so nobody has to rediscover it.

Two border tokens exist on purpose. `--py-color-border` (`#e4e6ec`, 1.2:1) is for decorative rules
and card edges, which WCAG does not require to be perceivable. `--py-color-border-interactive`
(`#82868e`, 3.65:1) is for anything a user must recognise as a control: inputs, checkboxes,
toggles. Using the decorative one on a form field is an accessibility bug.

## Typography

**No webfont.** The performance target is Core Web Vitals in the green on a midrange Android over
4G, and a webfont costs a round trip plus a font-swap layout shift for no benefit this brand
currently needs. `--py-font-sans` is a system stack. If the brand later adopts a typeface, it is a
one-line change in `tokens.css` and both products pick it up.

Type scale is fluid: every step is a `clamp()` interpolating between a 390px phone and a 1280px
desktop, so there are no jumps at breakpoints. Body copy is capped at `--py-measure` (68ch),
because Dutch runs long and an unbounded line is unreadable on a wide screen.

## Spacing and layout

A 4px base scale, plus two composite tokens that do the real work:

- `--py-space-gutter`: `clamp(1rem, 0.6rem + 1.8vw, 2rem)`. The side gutter, never below 16px, so
  text never touches the edge of a 390px screen. Applied once, by `.py-container`.
- `--py-space-section`: `clamp(2.5rem, 1.8rem + 3vw, 4.5rem)`. Vertical rhythm between page
  sections, tighter on a phone than on a desktop.

`--py-tap-target-min` is `2.75rem` (44px), the smallest control a thumb hits reliably. Every button
and every menu item carries it.

Breakpoints are 480, 768, 1024 and 1280. CSS cannot use a custom property inside a media query, so
they are duplicated in `@theme`; the token entries exist so the PWA reads the same numbers.

## Conventions

- Components reference **semantic roles** (`--py-color-primary`), never raw scale steps
  (`--py-blue-700`). Roles are what a redesign changes.
- Money, dates and times are formatted in `src/lib/format.ts`, never inline. Prices are integer
  cents until the moment they are displayed.
- `prefers-reduced-motion` zeroes the duration tokens at the root, so a component that uses them
  gets it right without asking.
