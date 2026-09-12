'use client'

import { useEffect, useRef, useState } from 'react'

import type { Coordinates } from '@/lib/content/schema'

/**
 * MapLibre is roughly 230 KB gzipped plus a stylesheet, which on a midrange
 * Android over 4G would be the single largest thing a location page downloads.
 * So it is never part of the initial payload: this component ships a button,
 * and the library is dynamically imported the first time someone asks for the
 * map. Until then the page costs about a kilobyte for this component.
 *
 * Tiles come from PDOK, the Dutch government's open geodata service. EU hosted,
 * no API key, no tracking, and not Google.
 */

const TILE_URL =
  'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png'
const ATTRIBUTION =
  '<a href="https://www.pdok.nl" target="_blank" rel="noopener">Kaartgegevens &copy; Kadaster / PDOK</a>'

type Status = 'idle' | 'loading' | 'ready' | 'failed'

export function MapCanvas({
  coordinates,
  label,
}: {
  coordinates: Coordinates
  label: string
}) {
  const container = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    if (status !== 'loading') return
    let cancelled = false
    let cleanup: (() => void) | undefined

    void (async () => {
      try {
        const maplibre = await import('maplibre-gl')
        await import('maplibre-gl/dist/maplibre-gl.css')
        if (cancelled || container.current === null) return

        const map = new maplibre.Map({
          container: container.current,
          center: [coordinates.lng, coordinates.lat],
          zoom: 15,
          attributionControl: false,
          style: {
            version: 8,
            sources: {
              pdok: {
                type: 'raster',
                tiles: [TILE_URL],
                tileSize: 256,
                attribution: ATTRIBUTION,
                maxzoom: 19,
              },
            },
            layers: [{ id: 'pdok', type: 'raster', source: 'pdok' }],
          },
        })

        map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right')
        map.addControl(new maplibre.AttributionControl({ compact: true }))
        new maplibre.Marker({ color: '#203d8b' })
          .setLngLat([coordinates.lng, coordinates.lat])
          .setPopup(new maplibre.Popup({ offset: 24 }).setText(label))
          .addTo(map)

        map.on('load', () => {
          if (!cancelled) setStatus('ready')
        })
        map.on('error', () => {
          if (!cancelled) setStatus('failed')
        })

        cleanup = () => {
          map.remove()
        }
      } catch {
        if (!cancelled) setStatus('failed')
      }
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [status, coordinates.lat, coordinates.lng, label])

  if (status === 'idle') {
    return (
      <button
        type="button"
        onClick={() => setStatus('loading')}
        className={[
          'flex w-full items-center justify-center gap-[var(--py-space-2)]',
          'min-h-[var(--py-tap-target-min)] rounded-[var(--py-radius-md)]',
          'border border-border-strong bg-surface',
          'px-[var(--py-space-4)] py-[var(--py-space-3)]',
          'font-[var(--py-weight-medium)] hover:bg-surface-subtle',
        ].join(' ')}
      >
        Bekijk op de kaart
      </button>
    )
  }

  if (status === 'failed') {
    return (
      <p role="status" className="text-sm text-foreground-muted">
        De kaart kan nu niet geladen worden. Gebruik de link hierboven om deze locatie in je eigen
        navigatie-app te openen.
      </p>
    )
  }

  return (
    <div className="relative">
      <div
        ref={container}
        role="application"
        aria-label={`Kaart met de locatie van ${label}`}
        className="aspect-[16/10] w-full overflow-hidden rounded-[var(--py-radius-md)] bg-surface-sunken"
      />
      {status === 'loading' && (
        <p
          role="status"
          className="absolute inset-0 flex items-center justify-center text-sm text-foreground-muted"
        >
          Kaart wordt geladen...
        </p>
      )}
    </div>
  )
}
