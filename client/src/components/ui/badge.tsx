import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "danger" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles = "badge"
  
  const variants = {
    default: "bg-primary text-primary-foreground border-transparent",
    secondary: "",
    danger: "badge-danger",
    outline: "bg-transparent text-foreground border-border",
    success: "badge-success",
    warning: "badge-warning",
  }

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  )
}

export { Badge }
