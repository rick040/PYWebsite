import { Icon } from '@/components/ui/icon'
import type { Faq } from '@/lib/content/schema'

/**
 * The prototype's FAQ accordion, built on native <details>.
 *
 * The prototype used React state and a button per row; <details> gives the same
 * look with no JavaScript, correct keyboard and screen-reader behaviour for
 * free, and it still opens if a bundle never arrives. Phase 4 emits FAQPage
 * structured data from the same records.
 */
export function FaqBlock({ faqs, title }: { faqs: readonly Faq[]; title: string }) {
  if (faqs.length === 0) return null

  return (
    <section className="py-faq" aria-labelledby="veelgestelde-vragen">
      <div className="py-section-intro">
        <h2 id="veelgestelde-vragen">{title}</h2>
      </div>
      <div className="py-faq__list">
        {faqs.map((faq) => (
          <details key={faq.id}>
            <summary>
              {faq.question}
              <Icon name="down" size={20} stroke={2.2} />
            </summary>
            <p className="py-faq__answer">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
