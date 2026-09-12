import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { Card, CardBody } from '@/components/ui/card'
import { getNews } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { absoluteUrl, routes } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Nieuws | ParkingYou',
  description: 'Nieuws en updates van ParkingYou over onze locaties, tarieven en dienstverlening.',
  alternates: { canonical: absoluteUrl(routes.news()) },
}

export default function NewsIndexPage() {
  const articles = getNews()

  return (
    <div className="py-container flex flex-col gap-[var(--py-space-section)] py-[var(--py-space-6)]">
      <header className="flex flex-col gap-[var(--py-space-4)]">
        <Breadcrumbs items={[{ label: 'Home', href: routes.home() }, { label: 'Nieuws' }]} />
        <h1 className="text-4xl">Nieuws</h1>
      </header>

      <ul className="flex flex-col gap-[var(--py-space-4)]">
        {articles.map((article) => (
          <li key={article.id}>
            <Card className="relative transition-shadow hover:shadow-[var(--py-shadow-md)]">
              <CardBody className="flex flex-col gap-[var(--py-space-2)]">
                <time dateTime={article.publishedAt} className="text-sm text-foreground-muted">
                  {formatDate(article.publishedAt)}
                </time>
                <h2 className="text-xl font-[var(--py-weight-semibold)]">
                  <Link href={`${routes.news()}/${article.slug}`} className="no-underline">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {article.title}
                  </Link>
                </h2>
                <p className="text-foreground-muted">{article.excerpt}</p>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
