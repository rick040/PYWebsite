import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/location/breadcrumbs'
import { FaqBlock } from '@/components/location/faq-block'
import { getGeneralFaqs } from '@/lib/content'
import { absoluteUrl, routes } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Veelgestelde vragen | ParkingYou',
  description:
    'Antwoorden op de vragen die we het vaakst krijgen: reserveren op kenteken, tarieven, abonnementen en de ParkingPass.',
  alternates: { canonical: absoluteUrl(routes.faq()) },
}

/**
 * The general FAQ. Draws from the same flat FAQ collection as the location and
 * city pages, so an answer is written once and shown wherever it is relevant.
 */
export default function FaqPage() {
  const faqs = getGeneralFaqs()

  return (
    <div className="py-container flex flex-col gap-[var(--py-space-6)] py-[var(--py-space-6)]">
      <header className="flex flex-col gap-[var(--py-space-4)]">
        <Breadcrumbs
          items={[{ label: 'Home', href: routes.home() }, { label: 'Veelgestelde vragen' }]}
        />
        <h1 className="text-4xl">Veelgestelde vragen</h1>
        <p className="py-prose text-lg text-foreground-muted">
          Staat je vraag er niet bij? Bel 040 8200 956 of mail naar info@parkingyou.nl.
        </p>
      </header>

      <FaqBlock faqs={faqs} title="Over reserveren, betalen en abonnementen" />
    </div>
  )
}
