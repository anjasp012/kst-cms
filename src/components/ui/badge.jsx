import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium tracking-normal border transition-colors',
  {
    variants: {
      variant: {
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
        rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
        destructive: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
        pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
        info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
        secondary: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/60',
        default: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/60',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const dotColor = {
  approved: 'bg-emerald-500',
  success: 'bg-emerald-500',
  rejected: 'bg-rose-500',
  destructive: 'bg-rose-500',
  pending: 'bg-amber-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  secondary: 'bg-zinc-400',
  default: 'bg-zinc-500',
}

function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColor[variant] || dotColor.default)} />
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
