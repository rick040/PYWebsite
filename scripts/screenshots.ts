/**
 * Captures the review screenshot set.
 *
 * 390px is a real iPhone 15 / mid-range Android viewport and is the width this
 * project is judged at, so it is the default. A 1280px desktop shot is taken
 * alongside it for the same pages.
 *
 * Requires a server already running on BASE_URL (npm run build && npm run start).
 * Run: npx tsx scripts/screenshots.ts
 */
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

import { chromium, type Browser } from 'playwright'

const BASE_URL = process.env['BASE_URL'] ?? 'http://127.0.0.1:3000'
const OUT_DIR = resolve(import.meta.dirname, '../screenshots')

const PAGES: ReadonlyArray<{ path: string; name: string }> = [
  { path: '/', name: 'home' },
  { path: '/parkeren/eindhoven/philips-stadion', name: 'locatie-philips-stadion' },
  { path: '/parkeren/rotterdam/hofplein', name: 'locatie-hofplein' },
  { path: '/parkeren/amsterdam/cruquius', name: 'locatie-cruquius' },
]

const VIEWPORTS: ReadonlyArray<{ label: string; width: number; height: number }> = [
  { label: '390', width: 390, height: 844 },
  { label: '1280', width: 1280, height: 900 },
]

async function capture(browser: Browser): Promise<number> {
  let count = 0
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
      locale: 'nl-NL',
    })
    const page = await context.newPage()

    for (const target of PAGES) {
      const response = await page.goto(`${BASE_URL}${target.path}`, { waitUntil: 'load' })
      const status = response?.status() ?? 0
      if (status !== 200) throw new Error(`${target.path} returned ${status}`)
      // Next prefetches route payloads in the background, so "networkidle" never
      // settles. Wait for the images this page actually renders instead.
      await page.waitForFunction(
        () => Array.from(document.images).every((image) => image.complete),
        undefined,
        { timeout: 15_000 },
      )

      const file = resolve(OUT_DIR, `${viewport.label}-${target.name}.png`)
      await page.screenshot({ path: file, fullPage: true })
      process.stdout.write(`  ${viewport.label}px  ${target.path}\n`)
      count += 1
    }

    await context.close()
  }
  return count
}

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true })
  // CHROMIUM_PATH lets a sandbox point at a pre-installed browser whose build
  // number does not match the npm package's pinned one.
  const executablePath = process.env['CHROMIUM_PATH']
  const browser = await chromium.launch(
    executablePath === undefined ? {} : { executablePath },
  )
  try {
    const count = await capture(browser)
    process.stdout.write(`Wrote ${count} screenshots to screenshots/\n`)
  } finally {
    await browser.close()
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`)
  process.exitCode = 1
})
