import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'border-forest/20 bg-forest/8 text-forest',
        stone: 'border-stone/40 bg-stone-light/40 text-charcoal-soft',
        bark: 'border-bark/20 bg-bark/8 text-bark',
        clay: 'border-clay/25 bg-clay/8 text-clay',
        outline: 'border-stone text-charcoal-soft',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
