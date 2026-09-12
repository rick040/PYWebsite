import type { ReactNode } from 'react'

import { Breadcrumbs, type Crumb } from '@/components/location/breadcrumbs'

/**
 * The prototype's page hero: a soft gradient band carrying the breadcrumb, the
 * H1 and a lead paragraph. Used by every template except the home page, which
 * has its own larger hero.
 */
export function PageHero({
  crumbs,
  title,
  intro,
  accent = false,
  children,
}: {
  crumbs: readonly Crumb[]
  title: ReactNode
  intro?: ReactNode
  accent?: boolean
  children?: ReactNode
}) {
  return (
    <section className={`py-page-hero${accent ? ' py-page-hero--accent' : ''}`}>
      <div className="py-container py-stack--tight flex flex-col">
        <Breadcrumbs items={crumbs} />
        <h1>{title}</h1>
        {intro !== undefined && <p>{intro}</p>}
        {children}
      </div>
    </section>
  )
}
