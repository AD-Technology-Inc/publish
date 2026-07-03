import * as React from 'react';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
    items: NavItem[];
    className?: string;
}

export const NavFooter: React.FC<Props> = ({ items, className }) => {
    return (
        <SidebarGroup className={cn("group-data-[collapsible=icon]:p-0", className)}>
            <SidebarMenu>
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <SidebarMenuItem key={item.title}>
                            <a href={item.href} target="_blank" rel="noopener noreferrer">
                                <SidebarMenuButton
                                    className="text-muted-foreground/60 hover:text-foreground transition-colors h-9 rounded-xl px-3 group"
                                >
                                    {Icon && <Icon className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.title}</span>
                                </SidebarMenuButton>
                            </a>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
};
