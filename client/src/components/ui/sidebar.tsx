import * as React from "react"
import { PanelLeft } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)
    const [_open, _setOpen] = React.useState(defaultOpen)

    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
      },
      [setOpenProp, open]
    )

    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((prev) => !prev)
        : setOpen((prev) => !prev)
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-background",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "group peer flex h-full w-[--sidebar-width] flex-col sidebar",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return openMobile ? (
        <div className="fixed inset-0 z-50 flex">
           <div className="fixed inset-0 bg-black/80" onClick={() => setOpenMobile(false)} />
           <div className="relative sidebar">
             {children}
           </div>
        </div>
      ) : null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "group peer hidden md:block text-primary shrink-0 transition-[width] ease-in-out duration-200 w-[var(--sidebar-width)]",
          "data-[collapsible=icon]:w-[--sidebar-width-icon]",
          "data-[collapsible=offcanvas]:w-0",
          className
        )}
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        <div
          className={cn(
            "duration-200 relative h-svh w-[var(--sidebar-width)] bg-transparent transition-[width] ease-in-out shrink-0",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]"
          )}
        />
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] ease-in-out md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="sidebar flex h-full w-full flex-col bg-background group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-border group-data-[variant=floating]:shadow-sm group-data-[collapsible=icon]:!w-[--sidebar-width-icon] group-data-[collapsible=icon]:overflow-hidden"
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="trigger"
      className={cn("h-7 w-7 flex items-center justify-center", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      } }
      {...props}
    >
      <PanelLeft className="h-4 w-4 shrink-0" />
      <span className="absolute overflow-hidden w-px h-px p-0 -m-px border-0 clip-path-[inset(50%)] whitespace-nowrap sr-only">Toggle Sidebar</span>
    </button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group"
    className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
    {...props}
  />
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-neutral-foreground/70 outline-none transition-[margin,opaicty] ease-linear [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "sidebar-content flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:!p-2",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("sidebar-footer group-data-[collapsible=icon]:!p-2", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("sidebar-header group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!h-12", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("sidebar-menu", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    isActive?: boolean
    variant?: "default" | "outline"
    size?: "default" | "sm" | "lg"
  }
>(
  (
    {
      isActive = false,
      variant = "default",
      size = "default",
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = "sidebar-item peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-[width,height,padding] disabled:pointer-events-none disabled:opacity-50 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:[&>span:last-child]:hidden"
    
    const variants = {
      default: "",
      outline: "bg-background shadow-[0_0_0_1px_hsl(var(--border))]"
    }

    const sizes = {
      default: "h-8 text-sm",
      sm: "h-7 text-xs",
      lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
    }

    return (
      <button
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(
            baseStyles, 
            variants[variant], 
            sizes[size], 
            isActive && "active font-medium",
            className
        )}
        {...props}
      />
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:m-2 peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
