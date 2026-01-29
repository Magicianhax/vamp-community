import { cn } from '@/lib/utils'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-600',
  primary: 'bg-primary-light text-primary',
  accent: 'bg-blue-50 text-blue-600',
  success: 'bg-green-50 text-green-600',
  warning: 'bg-amber-50 text-amber-600',
  error: 'bg-red-50 text-red-600',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  )
}

export interface StatusBadgeProps {
  status: string
  statusLabels: Record<string, string>
  statusColors: Record<string, string>
  className?: string
}

export function StatusBadge({ status, statusLabels, statusColors, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-xs font-medium',
        statusColors[status] || 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {statusLabels[status] || status}
    </span>
  )
}
