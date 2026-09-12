import Link from 'next/link'

export type Crumb = { readonly label: string; readonly href?: string | undefined }

/**
 * Mirrors the URL tree exactly, so the BreadcrumbList structured data added in
 * Phase 4 can be generated from this same array rather than assembled twice.
 */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Kruimelpad" className="text-sm text-foreground-muted">
      <ol className="flex flex-wrap items-center gap-x-[var(--py-space-2)] gap-y-[var(--py-space-1)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label} className="flex items-center gap-x-[var(--py-space-2)]">
              {index > 0 && (
                <span aria-hidden="true" className="text-border-strong">
                  /
                </span>
              )}
              {item.href !== undefined && !isLast ? (
                <Link href={item.href} className="hover:text-foreground-brand">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
