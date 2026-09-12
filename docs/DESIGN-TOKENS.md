# Design tokens

One visual language, two products. The marketing website (this repository) and the future PWA
share the tokens and nothing else: no shared component library, no shared framework, no coupling
beyond a list of values.

The design of record is the rebranding prototype at
[github.com/rick040/parkingyou](https://github.com/rick040/parkingyou). Its palette, typography,
pill buttons, card treatment and section rhythm are ported here verbatim, except for three colour
pairings that did not clear WCAG 2.1 AA. Those are corrected, and each correction is listed below.

## Where they live

| File | What it is | Who reads it |
| --- | --- | --- |
| `src/styles/tokens.css` | The source of truth. Plain CSS custom properties, no framework syntax. | This site, and the PWA by importing it |
| `src/styles/components.css` | The prototype's component CSS, with every literal value replaced by a token. | This site, and the PWA can lift any block of it |
| `design-tokens.json` | Generated from the CSS, every reference resolved to a concrete value. | Anything that cannot import CSS: a native shell, a Figma sync |
| `src/app/globals.css` | The Tailwind bridge, for one-off layout inside templates. | This site only |

Regenerate the JSON after any change to the CSS:

```
npx tsx scripts/export-tokens.ts
```

Everything is namespaced `--py-*` so importing `tokens.css` into the PWA cannot collide.

## Colour

| Role | Token | Value |
| --- | --- | --- |
| Brand blue | `--py-blue` | `#374e9d` |
| Gradient mid | `--py-mid` | `#233a89` |
| Deep navy, banners and footer | `--py-deep` | `#0d142e` |
| Aqua accent | `--py-aqua` | `#79cadc` |
| Orange accent | `--py-orange` | `#ee7d2c` |
| Body copy | `--py-text` | `#24335f` |
| Secondary copy | `--py-muted` | `#627092` |
| Paper, alternating sections | `--py-paper` | `#f5f7fb` |
| Hairline | `--py-line` | `#dfe5f0` |

### Measured contrast

Computed, not estimated. AA needs 4.5:1 for body text and 3:1 for non-text UI.

| Pair | Ratio | | |
| --- | --- | --- | --- |
| Body text on white | 12.25 | 4.5 | pass |
| Body text on paper | 11.42 | 4.5 | pass |
| Muted on white | 4.94 | 4.5 | pass |
| Muted on paper | 4.60 | 4.5 | pass |
| Brand blue on white | 7.67 | 4.5 | pass |
| White on the primary button | 7.67 | 4.5 | pass |
| White on deep navy | 18.16 | 4.5 | pass |
| White on the gradient mid stop | 10.30 | 4.5 | pass |
| Body navy on the aqua button | 6.59 | 4.5 | pass, **corrected** |
| Darkened orange on white | 4.80 | 4.5 | pass, **corrected** |
| Functional border on white | 3.11 | 3.0 | pass, **corrected** |

### The three corrections

**Aqua button label.** The prototype puts `--py-blue` on `--py-aqua`, which is **4.12:1**. A 15px
bold label is not "large text" under WCAG, so it needs 4.5. `--py-color-accent-foreground` is the
body navy instead, at 6.59:1. At a glance it reads as the same colour.

**Orange as text.** `#ee7d2c` on white is **2.76:1**. The prototype uses it for small bold labels
(`.py-product-chooser strong`, the step eyebrow, the hero ticket). `--py-orange-text` is the same
hue darkened to `#b8560f`, 4.80:1. The bright orange stays for backgrounds carrying dark text,
where it measures 6.58:1.

**Functional borders.** `--py-line` is **1.26:1** on white. That is fine for a decorative rule or a
card edge, and it stays. Anything a user must recognise as a control, an input or a checkbox, uses
`--py-color-border-interactive` (`#8492b3`, 3.11:1), clearing WCAG 1.4.11. Using the decorative
token on a form field is an accessibility bug, and the names say so.

## Typography

**Ubuntu**, as in the prototype, loaded through `next/font/google` rather than a `<link>` to
fonts.googleapis.com. That means the files are self-hosted and preloaded from our own origin: no
extra DNS lookup and TLS handshake, no render-blocking stylesheet, and a metric-matched fallback
that removes the font-swap layout shift the `<link>` version causes. On the target device, a
midrange Android over 4G, that is the difference between a green and an amber CLS.

Five faces ship, matching the prototype's own request exactly: 300, 400, 500 and 700 roman, plus
700 italic. Italic appears in one place, the emphasised word in the hero headline, so it is a
separate single-face family rather than four unused italic weights. Total: **71 KB**.

The type scale is fluid. Each step is a `clamp()` whose upper bound is the prototype's desktop
size (64px hero, 42px section heading) and whose lower bound is what fits a 390px phone.

## Spacing and layout

- `--py-container-max` is `73.75rem` (1180px), the prototype's container.
- `--py-space-gutter` is `clamp(1rem, 0.7rem + 1.4vw, 1.5rem)`: the prototype's 24px gutter on
  desktop, never below 16px, which is the minimum that keeps text off a 390px edge.
- `--py-space-section` is `clamp(3rem, 2rem + 4.4vw, 5.75rem)`: the prototype's 92px rhythm on
  desktop, tighter on a phone.
- `--py-tap-target-min` is 48px, the prototype's button height, comfortably over the 44px floor.

Breakpoints are the prototype's own: 720px and 980px, plus 480 and 1180 for convenience.

## Conventions

- Components reference **semantic roles** (`--py-color-primary`), never raw values (`--py-blue`).
  Roles are what a redesign changes.
- Component styling lives in `components.css` under `.py-*` class names, as in the prototype, not
  in utility soup. Tailwind is for one-off layout inside a template.
- Money, dates and times are formatted in `src/lib/format.ts`, never inline. Prices are integer
  cents until the moment they are displayed.
- `prefers-reduced-motion` zeroes the duration tokens at the root, so a component that uses them
  gets it right without asking.
