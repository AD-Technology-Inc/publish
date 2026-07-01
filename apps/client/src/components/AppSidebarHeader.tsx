import * as React from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/core";
import type { BreadcrumbItemType } from "@/types";

interface Props {
    breadcrumbs?: BreadcrumbItemType[];
}

export const AppSidebarHeader: React.FC<Props> = ({ breadcrumbs = [] }) => {
    return (
        <header className="app-shell-header justify-between">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 rounded-xl hover:bg-muted" />
                {breadcrumbs.length > 0 && (
                    <div className="flex items-center gap-2 ml-2">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                )}
            </div>

            <Badge
                variant="outline"
                className="text-[9px] font-mono py-0 px-2 rounded-full text-accent border-accent/80"
            >
                v0.1.0 - PRE-ALPHA
            </Badge>
        </header>
    );
};
