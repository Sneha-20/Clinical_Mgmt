import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const buttonVariants = {
  default: 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  ghost: 'hover:bg-gray-100 text-gray-700',
  link: 'text-teal-600 underline hover:text-teal-700'
}

const sizes = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 px-3 text-sm',
  lg: 'h-10 px-6 text-lg',
  icon: 'h-9 w-9'
}

const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button'
  
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        buttonVariants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Button.displayName = 'Button'

export { Button }
