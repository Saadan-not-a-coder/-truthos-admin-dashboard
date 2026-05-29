import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        school: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
        nonprofit:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
        business:
          'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
        invited:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
        active:
          'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
