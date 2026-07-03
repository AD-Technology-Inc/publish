import * as React from 'react';
import { 
    BarChart2, 
    TrendingUp, 
    Users, 
    MessageSquare, 
    Heart, 
    Share2, 
    MousePointer2,
    ChevronDown,
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

const stats = [
    { label: 'Total Impressions', value: '124.5k', change: '+12.3%', icon: BarChart2, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Reach', value: '82.1k', change: '+8.1%', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Engagement Rate', value: '4.2%', change: '+0.5%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Clicks', value: '12.4k', change: '+15.2%', icon: MousePointer2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

const platformPerformance = [
    { name: 'Instagram', engagement: '5.2%', followers: '12.4k', icon: Instagram, color: 'bg-pink-600' },
    { name: 'Facebook', engagement: '3.1%', followers: '8.2k', icon: Facebook, color: 'bg-blue-600' },
    { name: 'Twitter / X', engagement: '2.8%', followers: '15.1k', icon: Twitter, color: 'bg-sky-500' },
    { name: 'LinkedIn', engagement: '4.5%', followers: '5.4k', icon: Linkedin, color: 'bg-blue-700' },
];

export const Analytics: React.FC = () => {
    useTitle('Analytics');

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
                        <p className="text-muted-foreground text-sm">Performance metrics across all your social channels.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="bg-card border border-border shadow-sm rounded-xl py-0">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Last 30 Days
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                        <Button variant="outline" className="bg-card border border-border shadow-sm rounded-xl">
                            Export Report
                        </Button>
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
                    {/* Engagement Chart (Mock) */}
                    <Card className="lg:col-span-2 rounded-2xl shadow-sm border border-border bg-card">
                        <CardHeader className="text-left">
                            <CardTitle className="text-lg">Engagement Over Time</CardTitle>
                            <CardDescription>Daily engagement across all platforms</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full flex items-end gap-2 pt-8">
                                {[...Array(14)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="flex-1 bg-primary/10 hover:bg-primary/35 transition-all rounded-t-md relative group border-x border-t border-transparent hover:border-primary/25" 
                                        style={{ height: `${Math.random() * 80 + 10}%` }}
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border shadow-xl z-10">
                                            {Math.floor(Math.random() * 500)} Engagements
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-b border-r border-border rotate-45"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 border-t border-border pt-4">
                                <span>Feb 14</span>
                                <span>Feb 21</span>
                                <span>Feb 28</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Platform Breakdown */}
                    <Card className="rounded-2xl shadow-sm border border-border bg-card">
                        <CardHeader className="text-left">
                            <CardTitle className="text-lg">Platform Performance</CardTitle>
                            <CardDescription>Metrics by social network</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-7 py-4">
                            {platformPerformance.map((platform) => {
                                const Icon = platform.icon;
                                return (
                                    <div key={platform.name} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm', platform.color)}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-bold text-foreground">{platform.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-foreground block">{platform.engagement}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase">{platform.followers} followers</span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50 p-[1px]">
                                            <div className="h-full bg-primary rounded-full shadow-[0_0_8px_var(--primary)]/30 transition-all duration-1000 ease-out" style={{ width: platform.engagement }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                    <Card className="rounded-2xl shadow-sm border border-border bg-card">
                        <CardHeader className="text-left">
                            <CardTitle className="text-lg">Content Type Performance</CardTitle>
                            <CardDescription>Best performing post formats</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap items-center justify-around py-8 gap-8">
                                {['Video', 'Image', 'Text', 'Reel'].map((type) => (
                                    <div key={type} className="flex flex-col items-center gap-4 group">
                                        <div className="w-28 h-24 flex items-center justify-center relative">
                                            <svg className="absolute inset-0 w-full h-full -rotate-90 filter drop-shadow-sm">
                                                <circle 
                                                    cx="48" cy="48" r="40" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="10" 
                                                    className="text-muted/30"
                                                />
                                                <circle 
                                                    cx="48" cy="48" r="40" 
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    strokeWidth="10" 
                                                    className="text-primary transition-all duration-1000 ease-in-out" 
                                                    strokeDasharray="251" 
                                                    strokeDashoffset={251 - (Math.random() * 150 + 50)}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <span className="text-sm font-black text-foreground z-10">{Math.floor(Math.random() * 40 + 10)}%</span>
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">{type}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm border border-border bg-card">
                        <CardHeader className="text-left">
                            <CardTitle className="text-lg">Top Performing Posts</CardTitle>
                            <CardDescription>Your posts with the highest engagement</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 pt-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-all group cursor-pointer border border-transparent hover:border-border text-left">
                                        <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                                <BarChart2 className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors text-foreground">Amazing Launch Day Highlights!</h4>
                                            <div className="flex items-center gap-4 mt-1.5">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                    <Heart className="w-3.5 h-3.5 text-rose-500" /> 1.2k
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> 84
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                    <Share2 className="w-3.5 h-3.5 text-emerald-500" /> 42
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right pl-2">
                                            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">+12%</div>
                                            <div className="text-[9px] text-muted-foreground font-bold uppercase">vs avg</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default Analytics;
