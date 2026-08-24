import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRect: DOMRect | null;
  setTriggerRect: React.Dispatch<React.SetStateAction<DOMRect | null>>;
  setContentEl: (el: HTMLDivElement | null) => void;
} | null>(null);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);
  const [triggerEl, setTriggerEl] = React.useState<HTMLDivElement | null>(null);
  const [contentEl, setContentEl] = React.useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTrigger = triggerEl?.contains(target);
      const isInsideContent = contentEl?.contains(target);
      
      if (!isInsideTrigger && !isInsideContent) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, triggerEl, contentEl]);

  return (
    <DropdownMenuContext.Provider value={{ 
      open, 
      setOpen, 
      triggerRect, 
      setTriggerRect, 
      setContentEl 
    }}>
      <div ref={setTriggerEl} className="relative inline-block text-left w-full">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

const DropdownMenuTrigger = ({ children, asChild, ...props }: any) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) return null;
  const { open, setOpen, setTriggerRect } = context;

  const handleToggle = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTriggerRect(rect);
    setOpen(!open);
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
  if (!context) return null;
  const { open, triggerRect, setContentEl } = context;
  if (!open || !triggerRect) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    top: side === "bottom" ? triggerRect.bottom + sideOffset : triggerRect.top - sideOffset,
    left: align === "end" ? (triggerRect.right - 224) : triggerRect.left,
    transform: side === "top" ? 'translateY(-100%)' : 'none',
  };

  return createPortal(
    <div 
      ref={setContentEl}
      className={cn(
        "min-w-[12rem] overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl p-1.5 animate-in fade-in-0 zoom-in-95",
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
        "relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-colors hover:bg-muted text-foreground hover:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
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
  return <div className={cn("-mx-1 my-1.5 h-px bg-border/60", className)} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
