import type { Faq } from '@/lib/content/schema'

/**
 * Native <details>/<summary>. No JavaScript, no hydration, keyboard accessible
 * and screen-reader correct for free, and it still opens if a script fails.
 * Phase 4 emits FAQPage structured data from the same records.
 */
export function FaqBlock({ faqs, title }: { faqs: readonly Faq[]; title: string }) {
  if (faqs.length === 0) return null

  return (
    <section aria-labelledby="veelgestelde-vragen">
      <h2
        id="veelgestelde-vragen"
        className="mb-[var(--py-space-4)] text-2xl font-[var(--py-weight-bold)]"
      >
        {title}
      </h2>
      <div className="divide-y divide-border rounded-[var(--py-radius-lg)] border border-border">
        {faqs.map((faq) => (
          <details key={faq.id} className="group">
            <summary
              className={[
                'flex items-center justify-between gap-[var(--py-space-4)]',
                'px-[var(--py-space-5)] py-[var(--py-space-4)]',
                'min-h-[var(--py-tap-target-min)]',
                'font-[var(--py-weight-medium)] hover:bg-surface-subtle',
              ].join(' ')}
            >
              {faq.question}
              <span
                aria-hidden="true"
                className={[
                  'shrink-0 text-foreground-muted',
                  'transition-transform duration-[var(--py-duration-fast)]',
                  'group-open:rotate-45',
                ].join(' ')}
              >
                +
              </span>
            </summary>
            <div className="px-[var(--py-space-5)] pb-[var(--py-space-5)] text-foreground-muted">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
