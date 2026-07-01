import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

/**
 * Button Component
 */
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

/**
 * Card Components
 */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("card", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("card-header", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("card-title", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("card-description", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("card-content", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("card-footer", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

/**
 * Badge Component
 */
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

/**
 * Input Component
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "form-input",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

/**
 * Label Component
 */
const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "form-label",
        className
      )}
      {...props}
    />
  )
)
Label.displayName = "Label"

/**
 * Checkbox Component (Simplified)
 */
const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          "form-checkbox",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"

/**
 * Dropdown Menu Components (Functional)
 */
const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRect: DOMRect | null;
  setTriggerRect: React.Dispatch<React.SetStateAction<DOMRect | null>>;
  contentRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTrigger = triggerRef.current?.contains(target);
      const isInsideContent = contentRef.current?.contains(target);
      
      if (!isInsideTrigger && !isInsideContent) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ 
      open, 
      setOpen, 
      triggerRect, 
      setTriggerRect, 
      contentRef 
    }}>
      <div ref={triggerRef} className="relative inline-block text-left w-full">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

const DropdownMenuTrigger = ({ children, asChild, ...props }: any) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) return null;

  const handleToggle = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    context.setTriggerRect(rect);
    context.setOpen(!context.open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children.props as any).onClick?.(e);
        handleToggle(e);
      },
      ...props
    });
  }

  return (
    <div 
      className="cursor-pointer" 
      onClick={handleToggle}
      {...props}
    >
      {children}
    </div>
  )
}

const DropdownMenuContent = ({ className, children, align = "end", side = "bottom", sideOffset = 8 }: any) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context || !context.open || !context.triggerRect) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    top: side === "bottom" ? context.triggerRect.bottom + sideOffset : context.triggerRect.top - sideOffset,
    left: align === "end" ? (context.triggerRect.right - 224) : context.triggerRect.left,
    transform: side === "top" ? 'translateY(-100%)' : 'none',
  };

  return createPortal(
    <div 
      ref={context.contentRef}
      className={cn(
        "min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      style={style}
    >
      {children}
    </div>,
    document.body
  )
}

const DropdownMenuItem = ({ className, children, onClick, ...props }: any) => {
  const context = React.useContext(DropdownMenuContext);
  
  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
    context?.setOpen(false);
  };

  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-primary hover:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}

const DropdownMenuSeparator = ({ className }: any) => {
  return <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
}

/**
 * Separator Component
 */
const Separator = ({ className, orientation = "horizontal" }: { className?: string; orientation?: "horizontal" | "vertical" }) => (
  <div
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
  />
)

/**
 * Textarea Component
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "form-textarea",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

/**
 * Dialog (Modal) Components (Functional)
 */
const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

const Dialog = ({ children, open: controlledOpen, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen

  const setOpen = (value: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(value)
    }
    onOpenChange?.(value)
  }

  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const context = React.useContext(DialogContext);
  if (!context) return null;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children.props as any).onClick?.(e);
        context.setOpen(true);
      }
    });
  }

  return (
    <div onClick={() => context.setOpen(true)}>
      {children}
    </div>
  )
}

const DialogContent = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const context = React.useContext(DialogContext);
  if (!context || !context.open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="dialog-overlay" onClick={() => context.setOpen(false)} />
      <div className={cn(
        "dialog relative z-50",
        className
      )}>
        {children}
        <button
          onClick={() => context.setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>,
    document.body
  )
}

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("dialog-header", className)} {...props} />
)

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("dialog-title", className)} {...props} />
  )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("dialog-description", className)} {...props} />
  )
)
DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("dialog-footer", className)} {...props} />
)

const DialogClose = ({ children }: { children: React.ReactNode }) => {
  const context = React.useContext(DialogContext);
  if (!context) return null;
  return <div onClick={() => context.setOpen(false)}>{children}</div>
}

export {
  Button,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
  Label,
  Checkbox,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Separator,
  Textarea,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
}
