import Link from 'next/link'
import type { ComponentProps } from 'react'

import { Icon, type IconName } from './icon'
import { cn } from '@/lib/utils'

/**
 * The prototype's pill button, in its four variants.
 *
 * Styling lives in components.css rather than in utility classes, because the
 * prototype is the design of record and keeping one definition means the PWA
 * can lift the same rules. This file only decides which class to apply and
 * whether the thing is a button or a link.
 *
 * Minimum height is the tap-target token: 48px in the prototype, and never
 * below the 44px a thumb needs.
 */
export type ButtonVariant = 'primary' | 'aqua' | 'outline' | 'ghost' | 'on-dark'

type Shared = {
  variant?: ButtonVariant
  /** Trailing icon. Pass null for a label-only button. */
  icon?: IconName | null
  block?: boolean
}

function classes(variant: ButtonVariant, block: boolean, className?: string): string {
  return cn('py-button', `py-button--${variant}`, block && 'py-button--block', className)
}

export function Button({
  children,
  variant = 'primary',
  icon = null,
  block = false,
  className,
  ...props
}: ComponentProps<'button'> & Shared) {
  return (
    <button className={classes(variant, block, className)} {...props}>
      <span>{children}</span>
      {icon !== null && <Icon name={icon} size={18} stroke={2.25} />}
    </button>
  )
}

export function ButtonLink({
  children,
  variant = 'primary',
  icon = 'arrow',
  block = false,
  className,
  ...props
}: ComponentProps<typeof Link> & Shared) {
  return (
    <Link className={classes(variant, block, className)} {...props}>
      <span>{children}</span>
      {icon !== null && <Icon name={icon} size={18} stroke={2.25} />}
    </Link>
  )
}
