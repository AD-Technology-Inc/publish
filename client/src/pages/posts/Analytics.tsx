import * as React from 'react';
import { 
    BarChart2, 
    TrendingUp, 
    Users, 
    Layers,
    Share2, 
    MousePointer2,
    Calendar as CalendarIcon
} from 'lucide-react';
import { Instagram, Facebook, Twitter, Linkedin } from '@/components/SocialIcons';
import { AppLayout } from '@/layouts/AppLayout';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTitle } from '@/hooks/use-title';
import { accountsApi, postsApi } from '@/api/client';
import type { Account, Post } from '@/api/types';

export const Analytics: React.FC = () => {
    useTitle('Analytics');

    const [accounts, setAccounts] = React.useState<Account[]>([]);
    const [posts, setPosts] = React.useState<Post[]>([]);

    React.useEffect(() => {
        accountsApi.list().then(setAccounts).catch(() => setAccounts([]));
        postsApi.list().then(setPosts).catch(() => setPosts([]));
    }, []);

    const publishedCount = posts.filter(p => p.status === 'completed' || p.status === 'published').length;
    const inFlightCount = posts.filter(p => p.status === 'pending' || p.status === 'processing').length;

    const stats = [
        { label: 'Published Jobs', value: publishedCount.toString(), change: publishedCount > 0 ? 'Live' : '0', icon: BarChart2, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Active Channels', value: accounts.length.toString(), change: accounts.length > 0 ? 'Connected' : 'None', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'In Flight Operations', value: inFlightCount.toString(), change: inFlightCount > 0 ? 'Active' : 'Clear', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Total Operations', value: posts.length.toString(), change: 'Total', icon: MousePointer2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    const breadcrumbs = [
        { title: 'Posts', href: '/posts' },
        { title: 'Analytics', href: '/posts/analytics' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics Overview</h1>
                        <p className="text-muted-foreground text-sm">Real-time metrics across all your social channels and stream operations.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label} className="rounded-2xl shadow-sm border border-border bg-card">
                                <CardContent className="p-6 text-left">
                                    <div className="flex items-center justify-between">
                                        <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                                            <Icon className={cn('w-5 h-5', stat.color)} />
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {stat.change}
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                                        <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wide">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Platform Status */}
                    <Card className="lg:col-span-3 rounded-2xl shadow-sm border border-border bg-card">
                        <CardHeader className="text-left">
                            <CardTitle className="text-base font-bold">Connected Platforms Status</CardTitle>
                            <CardDescription>Status and active integration channels</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {accounts.length === 0 ? (
                                <div className="text-center py-8 space-y-2">
                                    <Share2 className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                                    <p className="text-xs text-muted-foreground">No channels currently linked.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {accounts.map((acc) => (
                                        <div key={acc.id} className="p-4 rounded-xl border border-border/60 bg-muted/20 text-left space-y-1.5">
                                            <p className="text-xs font-bold capitalize">{acc.name}</p>
                                            <p className="text-[11px] text-muted-foreground">{acc.provider} (ID: {acc.page_id})</p>
                                            <div className="pt-2">
                                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                    {acc.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};
