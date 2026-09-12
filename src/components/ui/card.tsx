import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-[var(--py-radius-lg)] border border-border bg-surface',
        'shadow-[var(--py-shadow-sm)]',
        className,
      )}
      {...props}
    />
  )
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-[var(--py-space-5)]', className)} {...props} />
}

export function Badge({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--py-radius-full)]',
        'bg-surface-brand-subtle text-foreground-brand',
        'px-[var(--py-space-3)] py-[var(--py-space-1)] text-sm',
        'font-[var(--py-weight-medium)]',
        className,
      )}
      {...props}
    />
  )
}
