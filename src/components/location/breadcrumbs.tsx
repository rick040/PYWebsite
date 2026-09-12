import Link from 'next/link'

export type Crumb = { readonly label: string; readonly href?: string | undefined }

/**
 * Mirrors the URL tree exactly, so the BreadcrumbList structured data added in
 * Phase 4 can be generated from this same array rather than assembled twice.
 */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Kruimelpad" className="py-breadcrumbs">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label}>
              {index > 0 && (
                <span aria-hidden="true" className="px-[var(--py-space-1)] opacity-50">
                  /
                </span>
              )}
              {item.href !== undefined && !isLast ? (
                <Link href={item.href}>{item.label}</Link>
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
