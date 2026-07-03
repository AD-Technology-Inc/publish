import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AppSidebarHeader } from '@/components/AppSidebarHeader';
import type { BreadcrumbItemType } from '@/types';

interface Props {
    breadcrumbs?: BreadcrumbItemType[];
    children?: React.ReactNode;
}

export const AppLayout: React.FC<Props> = ({ breadcrumbs = [], children }) => {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children || <Outlet />}
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AppLayout;
