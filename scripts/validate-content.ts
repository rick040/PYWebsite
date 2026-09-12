/**
 * Validates /content against the schemas and reports the outstanding
 * {{TODO-NL: ...}} markers.
 *
 * Importing the content module is the validation: it parses every file and
 * asserts referential integrity at module load, so a bad file throws here
 * instead of at build time.
 *
 * Run: npm run content:validate
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { getCities, getFaqsByIds, getLocations } from '../src/lib/content'

const CONTENT_DIR = resolve(import.meta.dirname, '../content')
const TODO_PATTERN = /\{\{TODO-NL:[^}]*\}\}/g

function main(): void {
  const cities = getCities()
  const locations = getLocations()

  const out: string[] = []
  out.push(`cities     ${cities.length}`)
  out.push(`locations  ${locations.length}`)
  out.push(
    `faqs       ${new Set(locations.flatMap((l) => getFaqsByIds(l.faqIds).map((f) => f.id))).size} linked from locations`,
  )
  out.push('')

  let todoCount = 0
  for (const file of readdirSync(CONTENT_DIR).filter((name) => name.endsWith('.json')).sort()) {
    const body = readFileSync(join(CONTENT_DIR, file), 'utf8')
    const matches = [...body.matchAll(TODO_PATTERN)]
    todoCount += matches.length
    if (matches.length > 0) {
      out.push(`${file}: ${matches.length} open TODO-NL`)
      for (const match of matches) out.push(`  ${match[0]}`)
    }
  }

  out.push('')
  out.push(`Content is valid. ${todoCount} Dutch facts still to confirm.`)
  process.stdout.write(`${out.join('\n')}\n`)
}

main()
