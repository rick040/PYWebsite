import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/** A plain bordered panel, the prototype's default surface for grouped content. */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('py-panel', className)} {...props} />
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn(className)} {...props} />
}

/** The prototype's pill tag, used for location features. */
export function Badge({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('py-tag', className)} {...props} />
}
