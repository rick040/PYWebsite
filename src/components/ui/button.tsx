import { cva, type VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/**
 * Built in the shadcn/ui style: a class-variance-authority recipe over the
 * design tokens, not a wrapper around a third-party component. Every colour and
 * radius below resolves to a token, so the future PWA can reproduce this button
 * exactly from design-tokens.json.
 *
 * The minimum height is the token tap target: 44px is the smallest control that
 * a thumb hits reliably, and this site is judged on a phone.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[var(--py-radius-md)] font-[var(--py-weight-semibold)]',
    'min-h-[var(--py-tap-target-min)]',
    'transition-colors duration-[var(--py-duration-fast)]',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
        secondary:
          'bg-surface text-foreground-brand border border-border-strong hover:bg-surface-subtle',
        ghost: 'text-foreground-brand hover:bg-surface-brand-subtle',
      },
      size: {
        md: 'px-[var(--py-space-5)] py-[var(--py-space-3)] text-base',
        lg: 'px-[var(--py-space-6)] py-[var(--py-space-4)] text-lg w-full sm:w-auto',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>

export function Button({
  className,
  variant,
  size,
  ...props
}: ComponentProps<'button'> & ButtonVariants) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

/**
 * A link styled as a button. Separate from Button on purpose: a thing that
 * navigates must be an anchor so it opens in a new tab, gets copied, and is
 * announced correctly.
 */
export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & ButtonVariants) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), 'no-underline', className)}
      {...props}
    />
  )
}

export { buttonVariants }
