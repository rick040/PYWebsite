import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { ProseSections } from '@/components/site/prose-sections'
import { getNews, getNewsArticle } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { absoluteUrl, routes } from '@/lib/routes'

type PageParams = { slug: string }

export function generateStaticParams(): PageParams[] {
  return getNews().map((article) => ({ slug: article.slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getNewsArticle(slug)
  if (article === undefined) return {}

  const canonical = absoluteUrl(`${routes.news()}/${article.slug}`)
  return {
    title: article.seo.title,
    description: article.seo.description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      locale: 'nl_NL',
      url: canonical,
      title: article.seo.title,
      description: article.seo.description,
      publishedTime: article.publishedAt,
    },
  }
}

export default async function NewsArticlePage({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params
  const article = getNewsArticle(slug)
  if (article === undefined) notFound()

  return (
    <article className="py-container flex flex-col gap-[var(--py-space-6)] py-[var(--py-space-6)]">
      <header className="flex flex-col gap-[var(--py-space-3)]">
        <Breadcrumbs
          items={[
            { label: 'Home', href: routes.home() },
            { label: 'Nieuws', href: routes.news() },
            { label: article.title },
          ]}
        />
        <time dateTime={article.publishedAt} className="text-sm text-foreground-muted">
          {formatDate(article.publishedAt)}
        </time>
        <h1 className="text-3xl">{article.title}</h1>
        <p className="py-prose text-lg text-foreground-muted">{article.excerpt}</p>
      </header>

      <ProseSections sections={article.body} />

      <p>
        <Link href={routes.news()} className="text-foreground-brand">
          Terug naar het nieuwsoverzicht
        </Link>
      </p>
    </article>
  )
}
