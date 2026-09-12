import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { FaqBlock } from '@/components/location/faq-block'
import { ProseSections } from '@/components/site/prose-sections'
import { ButtonLink } from '@/components/ui/button'
import { getFaqsByIds, getPage, getPageSlugs } from '@/lib/content'
import { absoluteUrl, routes } from '@/lib/routes'

type PageParams = { slug: string[] }

export function generateStaticParams(): PageParams[] {
  return getPageSlugs().map((slug) => ({ slug: slug.split('/') }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(slug.join('/'))
  if (page === undefined) return {}

  const canonical = absoluteUrl(`/${page.slug}`)
  return {
    title: page.seo.title,
    description: page.seo.description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      url: canonical,
      title: page.seo.title,
      description: page.seo.description,
    },
  }
}

/**
 * The flat pages: abonnementen, ParkingPass, zakelijk, over ons, contact.
 *
 * One catch-all route rather than five near-identical files. In Phase 2 these
 * become the Payload `pages` collection and this route keeps working unchanged.
 */
export default async function FlatPageRoute({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params
  const page = getPage(slug.join('/'))
  if (page === undefined) notFound()

  const faqs = getFaqsByIds(page.faqIds)
  const parentSlug = page.slug.includes('/') ? page.slug.split('/')[0] : undefined
  const parent = parentSlug === undefined ? undefined : getPage(parentSlug)

  return (
    <div className="py-container flex flex-col gap-[var(--py-space-section)] py-[var(--py-space-6)]">
      <header className="flex flex-col gap-[var(--py-space-4)]">
        <Breadcrumbs
          items={[
            { label: 'Home', href: routes.home() },
            ...(parent === undefined ? [] : [{ label: parent.h1, href: `/${parent.slug}` }]),
            { label: page.h1 },
          ]}
        />
        <h1 className="text-4xl">{page.h1}</h1>
        <p className="py-prose text-lg text-foreground-muted">{page.intro}</p>
        {page.cta !== undefined && (
          <ButtonLink href={page.cta.href} size="lg" className="self-start">
            {page.cta.label}
          </ButtonLink>
        )}
      </header>

      <ProseSections sections={page.sections} />

      <FaqBlock faqs={faqs} title="Veelgestelde vragen" />
    </div>
  )
}
