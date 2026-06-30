import * as React from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import { Heading } from '@/components/Heading';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui/core';
import { 
    Check, 
    CreditCard, 
    Download, 
    ShieldCheck,
    Clock,
    Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTitle } from '@/hooks/use-title';

interface Plan {
    name: string;
    price: string;
    description: string;
    features: string[];
    current: boolean;
}

interface Invoice {
    id: string;
    date: string;
    amount: string;
    status: string;
}

export const Billing: React.FC = () => {
    useTitle('Billing & Subscription');
    
    const breadcrumbs = [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Billing', href: '/settings/billing' },
    ];

    const plans: Plan[] = [
        {
            name: 'Starter',
            price: '$0',
            description: 'Perfect for exploring the platform and personal use.',
            features: ['3 Social Profiles', '10 Posts / Month', 'Basic Analytics', 'Standard Support'],
            current: false,
        },
        {
            name: 'Pro',
            price: '$29',
            description: 'Ideal for growing businesses and social media managers.',
            features: ['10 Social Profiles', 'Unlimited Posts', 'Advanced Analytics', 'Priority Support', 'Team Collaboration'],
            current: true,
        },
        {
            name: 'Enterprise',
            price: '$99',
            description: 'Complete solution for large agencies and corporations.',
            features: ['Unlimited everything', 'Custom Reporting', 'Dedicate Manager', 'API Access', 'SSO'],
            current: false,
        },
    ];

    const invoices: Invoice[] = [
        { id: 'INV-2026-001', date: 'Feb 15, 2026', amount: '$29.00', status: 'Paid' },
        { id: 'INV-2026-002', date: 'Jan 15, 2026', amount: '$29.00', status: 'Paid' },
        { id: 'INV-2025-012', date: 'Dec 15, 2025', amount: '$29.00', status: 'Paid' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout size="md">
                <div className="space-y-10 text-left pb-20">
                    <Heading 
                        title="Billing & Subscription" 
                        description="Manage your organization's plan, payment methods, and invoices." 
                    />

                    {/* Current Plan Overview */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 opacity-60">Your active subscription</h3>
                        <Card className="rounded-[2.5rem] border-border/60 bg-linear-to-br from-accent/5 to-transparent shadow-none overflow-hidden relative group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-700"></div>
                            <CardContent className="p-8 relative z-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 rounded-2xl bg-accent text-accent-foreground shadow-xl shadow-accent/15">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-foreground tracking-tight">Pro Plan</h4>
                                                <p className="text-sm text-muted-foreground font-medium mt-0.5">Your organization is currently on the Pro package.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground bg-background border border-border px-3.5 py-2 rounded-xl shadow-xs">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background/50 border border-border px-3.5 py-2 rounded-xl shadow-xs">
                                                <Clock className="w-3.5 h-3.5 opacity-40" /> Renews on March 15, 2026
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background/50 border border-border px-3.5 py-2 rounded-xl shadow-xs">
                                                <CreditCard className="w-3.5 h-3.5 opacity-40" /> Visa ending in 4242
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                        <div className="text-center md:text-right mb-1">
                                            <span className="text-5xl font-black text-foreground tracking-tighter">$29</span>
                                            <span className="text-sm text-muted-foreground font-bold italic opacity-40 ml-1">/month</span>
                                        </div>
                                        <Button variant="accent" className="w-full rounded-2xl font-bold h-12 shadow-lg shadow-accent/15">Manage Billing</Button>
                                        <Button variant="ghost" className="w-full rounded-2xl font-bold h-12 text-xs text-muted-foreground hover:bg-rose-500/5 hover:text-rose-500">Cancel Subscription</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Plan Options */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Explore Upgrade Options</h3>
                            <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest rounded-full px-3 py-1 bg-accent/5 text-accent border-accent/20">Save 20% Annual</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <Card key={plan.name} 
                                      className={cn('rounded-[2.5rem] border-border/60 bg-card shadow-sm transition-all duration-500 flex flex-col', 
                                                 plan.current ? 'ring-2 ring-accent bg-accent/[0.01] shadow-xl shadow-accent/[0.05]' : 'hover:border-accent/20 hover:shadow-lg')}>
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">{plan.name}</span>
                                            {plan.name === 'Pro' && <Star className="w-4 h-4 text-accent fill-accent" />}
                                        </div>
                                        <CardTitle className="text-4xl font-black text-foreground tracking-tighter">{plan.price}</CardTitle>
                                        <CardDescription className="text-xs font-medium pt-3 leading-relaxed opacity-60">{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-2 flex-1 flex flex-col">
                                        <div className="space-y-4 mb-10 flex-1">
                                            {plan.features.map((feature) => (
                                                <div key={feature} className="flex items-start gap-3.5">
                                                    <div className="p-1 rounded-full bg-accent/10 text-accent mt-0.5 shadow-inner">
                                                        <Check className="w-2.5 h-2.5 stroke-[4px]" />
                                                    </div>
                                                    <span className="text-xs font-bold text-foreground/70 leading-tight">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <Button 
                                            variant={plan.current ? 'secondary' : 'outline'} 
                                            disabled={plan.current}
                                            className="w-full rounded-2xl font-black h-14 uppercase tracking-widest text-[10px] shadow-xs active:scale-95 transition-transform"
                                        >
                                            {plan.current ? 'Currently Active' : 'Switch Package'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Invoice History */}
                    <section className="space-y-5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 opacity-60">Transaction History</h3>
                        <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-muted/20">
                                            <th className="p-6 font-black uppercase tracking-[0.15em] text-[10px] text-muted-foreground opacity-60">Reference</th>
                                            <th className="p-6 font-black uppercase tracking-[0.15em] text-[10px] text-muted-foreground opacity-60">Date</th>
                                            <th className="p-6 font-black uppercase tracking-[0.15em] text-[10px] text-muted-foreground opacity-60">Amount</th>
                                            <th className="p-6 font-black uppercase tracking-[0.15em] text-[10px] text-muted-foreground opacity-60">Status</th>
                                            <th className="p-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {invoices.map((invoice) => (
                                            <tr key={invoice.id} className="hover:bg-muted/10 transition-colors group">
                                                <td className="p-6 font-bold text-sm text-foreground">{invoice.id}</td>
                                                <td className="p-6 text-xs text-muted-foreground font-black uppercase tracking-widest">{invoice.date}</td>
                                                <td className="p-6 font-black text-sm text-foreground italic">{invoice.amount}</td>
                                                <td className="p-6">
                                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10 font-black text-[9px] uppercase tracking-widest rounded-full px-3 py-1">
                                                        {invoice.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-background border border-transparent hover:border-border transition-all">
                                                        <Download className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </section>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
};

export default Billing;
