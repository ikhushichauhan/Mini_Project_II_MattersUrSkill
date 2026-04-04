import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "shadow",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-500/90",
        outline:
          "shadow-sm",
        secondary:
          "bg-gray-100 text-black shadow-sm hover:bg-gray-200",
        ghost: "hover:bg-gray-100 hover:text-black",
        link: "text-black underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  
  let variantStyles = ''
  if (variant === 'default') {
    variantStyles = 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:opacity-90'
  } else if (variant === 'outline') {
    variantStyles = 'bg-[var(--button-outline-bg)] text-[var(--button-outline-text)] border border-[var(--button-outline-border)] hover:opacity-90'
  }
  
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), variantStyles, className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
