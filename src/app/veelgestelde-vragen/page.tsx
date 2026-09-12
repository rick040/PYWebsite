import type { Metadata } from 'next'

import { FaqBlock } from '@/components/location/faq-block'
import { PageHero } from '@/components/site/page-hero'
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
    <>
      <PageHero
        crumbs={[{ label: 'Home', href: routes.home() }, { label: 'Veelgestelde vragen' }]}
        title="Veelgestelde vragen"
        intro="Staat je vraag er niet bij? Bel 040 8200 956 of mail naar info@parkingyou.nl."
      />
      <div className="py-section py-container">
        <FaqBlock faqs={faqs} title="Over reserveren, betalen en abonnementen" />
      </div>
    </>
  )
}
