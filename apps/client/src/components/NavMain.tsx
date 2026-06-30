import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
    items: NavItem[];
    label?: string;
}

export const NavMain: React.FC<Props> = ({ items, label }) => {
    const location = useLocation();

    return (
        <SidebarGroup>
            {label && (
                <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-2 px-2">
                    {label}
                </SidebarGroupLabel>
            )}
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const active = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <SidebarMenuItem key={item.title}>
                            <Link to={item.href}>
                                <SidebarMenuButton
                                    isActive={active}
                                    className={cn(
                                        "h-10 rounded-xl px-3 transition-all group-data-[state=collapsed]:px-0",
                                        active
                                            ? "hover:bg-accent-hover"
                                            : "hover:bg-accent-hover",
                                    )}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        {Icon && (
                                            <Icon
                                                className={cn(
                                                    "size-4.5 stroke-[2.5px] transition-colors",
                                                    active
                                                        ? "text-sidebar-accent-foreground"
                                                        : "text-muted-foreground/60 group-hover:text-foreground",
                                                )}
                                            />
                                        )}
                                        <span
                                            className={cn(
                                                "text-[11px] font-black uppercase tracking-widest transition-colors",
                                                active
                                                    ? "text-sidebar-accent-foreground"
                                                    : "text-muted-foreground/70 group-hover:text-foreground",
                                            )}
                                        >
                                            {item.title}
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
};
