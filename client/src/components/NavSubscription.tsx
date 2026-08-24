import * as React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import type { Subscription } from '@/types';

// Subscription data is not yet exposed via the API.
// This component renders a sensible placeholder until the billing endpoint
// is available. Replace the `subscription` constant with an API call then.
const PLACEHOLDER: Subscription = {
    plan: 'Pro',
    status: 'active',
    days_remaining: 0,
    renews_at: '',
    is_trial: false,
};

export const NavSubscription: React.FC = () => {
    // TODO: replace with real API call when billing endpoint is ready
    // e.g. billingApi.subscription().then(setSubscription).catch(...)
    const subscription = PLACEHOLDER;
    const hasDays = subscription.days_remaining > 0;
    const progress = hasDays
        ? Math.max(0, Math.min(100, (subscription.days_remaining / 30) * 100))
        : null;

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden px-2 py-4">
            {hasDays && (
                <div className="px-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Subscription</span>
                        <span className="text-[9px] font-black text-primary uppercase tracking-tighter">{subscription.days_remaining} days left</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000 shadow-lg shadow-primary/20"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <SidebarMenu>
                <SidebarMenuItem>
                    <Link to="/settings/billing">
                        <SidebarMenuButton className="bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all h-14 rounded-2xl p-0 overflow-hidden group w-full">
                            <div className="flex items-center gap-3 px-3 w-full h-full">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-4 h-4 fill-current" />
                                </div>
                                <div className="flex flex-col min-w-0 text-left">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-foreground leading-none">{subscription.plan}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground/60 mt-1.5 uppercase tracking-tighter truncate">Upgrade your features</span>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
};
