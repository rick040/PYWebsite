/**
 * Generates design-tokens.json from src/styles/tokens.css.
 *
 * The CSS file is the single source of truth. The JSON exists so that consumers
 * that cannot import CSS -- the future PWA's native shell, a Figma sync, a
 * React Native theme -- read the same numbers instead of a copy that drifts.
 *
 * Run: npx tsx scripts/export-tokens.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SOURCE = resolve(ROOT, 'src/styles/tokens.css')
const TARGET = resolve(ROOT, 'design-tokens.json')

type TokenGroup = Record<string, Record<string, string>>

/** Everything before the first dash of the remainder is the group name. */
function groupFor(name: string): { group: string; key: string } {
  const parts = name.split('-')
  const [first, second] = parts
  if (first === undefined) return { group: 'other', key: name }

  // --py-color-foreground-muted -> group "color", key "foreground-muted"
  // --py-blue-700               -> group "blue",  key "700"
  if (first === 'color' || first === 'font' || first === 'text' || first === 'space') {
    return { group: first, key: parts.slice(1).join('-') }
  }
  if (second !== undefined && /^\d+$/.test(second) && parts.length === 2) {
    return { group: first, key: second }
  }
  return { group: first, key: parts.slice(1).join('-') || first }
}

function main(): void {
  const css = readFileSync(SOURCE, 'utf8')

  // Only read the :root block, so the prefers-reduced-motion overrides at the
  // bottom of the file do not overwrite the base durations.
  const rootStart = css.indexOf(':root {')
  if (rootStart === -1) throw new Error(`No :root block found in ${SOURCE}`)
  const rootEnd = css.indexOf('\n}', rootStart)
  if (rootEnd === -1) throw new Error(`Unterminated :root block in ${SOURCE}`)
  const root = css.slice(rootStart, rootEnd)

  const declared = new Map<string, string>()
  for (const match of root.matchAll(/^\s*--py-([a-z0-9-]+):\s*([^;]+);/gm)) {
    const name = match[1]
    const rawValue = match[2]
    if (name === undefined || rawValue === undefined) continue
    declared.set(name, rawValue.replace(/\s+/g, ' ').trim())
  }

  /**
   * A semantic role points at a raw token: `--py-color-primary: var(--py-blue-700)`.
   * CSS resolves that at runtime, but a native consumer reading the JSON cannot,
   * so resolve the chain here and publish the concrete value.
   */
  function resolve(value: string, seen: ReadonlySet<string> = new Set()): string {
    return value.replace(/var\(\s*--py-([a-z0-9-]+)\s*\)/g, (whole, ref: string) => {
      if (seen.has(ref)) throw new Error(`Circular token reference at --py-${ref}`)
      const target = declared.get(ref)
      if (target === undefined) throw new Error(`--py-${ref} is referenced but never declared`)
      return resolve(target, new Set([...seen, ref]))
    })
  }

  const groups: TokenGroup = {}
  let count = 0

  for (const [name, value] of declared) {
    const { group, key } = groupFor(name)
    const bucket = groups[group] ?? (groups[group] = {})
    bucket[key] = resolve(value)
    count += 1
  }

  const output = {
    $description:
      'ParkingYou design tokens. Generated from src/styles/tokens.css by scripts/export-tokens.ts. Do not edit by hand.',
    $source: 'src/styles/tokens.css',
    ...Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))),
  }

  writeFileSync(TARGET, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  process.stdout.write(`Wrote ${count} tokens in ${Object.keys(groups).length} groups to design-tokens.json\n`)
}

main()
