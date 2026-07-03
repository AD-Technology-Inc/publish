import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "danger" | "outline" | "secondary" | "ghost" | "link" | "accent"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "button [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
    
    const variants = {
      default: "button-default",
      danger: "button-danger",
      outline: "button-outline",
      secondary: "button-secondary",
      ghost: "button-ghost",
      link: "button-link",
      accent: "button-accent",
    }

    const sizes = {
      default: "",
      sm: "button-sm",
      lg: "button-lg",
      icon: "w-9 p-0",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
