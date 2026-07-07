import * as React from "react";
import { LayoutGrid, Send, BarChart2, Folder, BookOpen } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { AppLogo } from "@/components/AppLogo";
import { NavMain } from "@/components/NavMain";
import { NavFooter } from "@/components/NavFooter";
import { NavSubscription } from "@/components/NavSubscription";
import { NavUser } from "@/components/NavUser";
import type { NavItem } from "@/types";

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutGrid,
    },
    {
        title: "Posts",
        href: "/posts",
        icon: Send,
    },
    {
        title: "Analytics",
        href: "/posts/analytics",
        icon: BarChart2,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: "Github Repo",
        href: "https://github.com/AD-Technology-Inc/publish",
        icon: Folder,
    },
    {
        title: "Documentation",
        href: "https://github.com/AD-Technology-Inc/publish",
        icon: BookOpen,
    },
];

export const AppSidebar: React.FC = () => {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="flex h-12 items-center px-3">
                    <AppLogo />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Platform" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} />
                <NavSubscription />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
};
