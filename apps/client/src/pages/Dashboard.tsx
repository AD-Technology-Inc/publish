import * as React from 'react';
import { Link } from 'react-router-dom';
import { 
    Plus, 
    Zap, 
    Clock, 
    Target,
    ChevronRight,
    Calendar as CalendarIcon,
    ExternalLink
} from 'lucide-react';
import { Instagram, Facebook, Twitter, Linkedin } from '@/components/SocialIcons';

import { AppLayout } from '@/layouts/AppLayout';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/core';
import { cn } from '@/lib/utils';
import { mockUser, mockRecentActivities, mockDashboardStats } from '@/mocks';
import { useTitle } from '@/hooks/use-title';

const getPlatformIcon = (provider: string) => {
    switch (provider) {
        case 'facebook': return Facebook;
        case 'instagram': return Instagram;
        case 'twitter': return Twitter;
        case 'linkedin': return Linkedin;
        default: return Zap;
    }
};

const getPlatformBrand = (provider: string) => {
    switch (provider) {
        case 'facebook': return { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' };
        case 'instagram': return { color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/30' };
        case 'twitter': return { color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/30' };
        case 'linkedin': return { color: 'text-blue-700', bg: 'bg-indigo-50 dark:bg-indigo-950/30' };
        default: return { color: 'text-muted-foreground', bg: 'bg-muted' };
    }
};

export const Dashboard: React.FC = () => {
    useTitle('Dashboard');
    const user = mockUser;
    
    // Mimicking the original connections structure
    const connections = [
        { id: 1, provider: 'instagram' as const, name: '@adpublish' },
        { id: 2, provider: 'facebook' as const, name: 'AD. Publish Page' },
    ];

    const breadcrumbs = [{ title: 'Dashboard', href: '/dashboard' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-8 p-6 max-w-7xl w-full mx-auto pb-20 animate-in fade-in duration-700 slide-in-from-bottom-4">
                
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1 text-left">
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            Welcome back, <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span>!
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex -space-x-2">
                                {connections.map((conn) => {
                                    const brand = getPlatformBrand(conn.provider);
                                    const Icon = getPlatformIcon(conn.provider);
                                    return (
                                        <div key={conn.id} className={cn('w-6 h-6 rounded-full border-2 border-background flex items-center justify-center shadow-sm transition-transform hover:scale-110 z-10', brand.bg)}>
                                            <Icon className={cn('w-3 h-3', brand.color)} />
                                        </div>
                                    );
                                })}
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] opacity-60">
                                {connections.length} operational channels synced
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/posts/create">
                            <Button className="rounded-2xl px-6 h-12 gap-2 font-bold shadow-[0_20px_40px_-12px_rgba(var(--primary),0.3)] border-0 transition-transform active:scale-95">
                                <Plus className="w-4 h-4 stroke-[3px]" /> Compose New Post
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Performance Overview Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Side: Performance Metrics */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {mockDashboardStats.map((stat) => (
                                <Card key={stat.label} className="group border-border/50 bg-card hover:border-primary/20 transition-all duration-300 rounded-[2.5rem] overflow-hidden text-left shadow-sm hover:shadow-xl hover:shadow-primary/[0.02]">
                                    <div className="p-7 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className={cn('p-3 rounded-2xl transition-all group-hover:scale-110 duration-500', stat.bg)}>
                                                <stat.icon className={cn('w-5 h-5', stat.color)} />
                                            </div>
                                            <Badge variant="outline" className="rounded-full text-[9px] font-black uppercase border-emerald-500/20 text-emerald-600 bg-emerald-500/5 px-2.5 py-1">
                                                {stat.change}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-3xl font-black tracking-tight text-foreground tabular-nums">{stat.value}</h3>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 leading-none">{stat.label}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Chart Component Placeholder */}
                        <Card className="rounded-[2.5rem] border-border/60 bg-card shadow-sm text-left">
                            <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold">Engagement Velocity</CardTitle>
                                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Performance trends • Last 14 Days</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-xl h-9 text-[10px] font-black uppercase tracking-widest gap-2 bg-background border-border hover:bg-muted">
                                    <CalendarIcon className="w-4 h-4 opacity-50" /> Filter
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8 pt-10">
                                <div className="h-[260px] w-full flex items-end gap-3 px-2">
                                    {[65, 45, 75, 55, 90, 40, 60, 85, 50, 70, 95, 35, 80, 100].map((height, i) => (
                                        <div key={i} className="flex-1 group relative">
                                            <div 
                                                className={cn(
                                                    'w-full bg-primary/5 rounded-t-xl transition-all duration-700 group-hover:bg-primary/20 cursor-pointer',
                                                    i === 13 ? 'bg-primary/20' : ''
                                                )} 
                                                style={{ height: `${height}%` }} 
                                            />
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl z-20">
                                                {Math.floor(height * 12.5)} reach
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-8 px-2 pt-6 border-t border-border/40 text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                                    <span>Feb 15</span>
                                    <span>Today</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Feed */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Real-time Activity Feed</h2>
                                <Link to="/posts" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary transition-opacity hover:opacity-80">View history</Link>
                            </div>
                            <div className="grid gap-3">
                                {mockRecentActivities.map((activity) => {
                                    const brand = getPlatformBrand(activity.platform.toLowerCase());
                                    const Icon = getPlatformIcon(activity.platform.toLowerCase());
                                    return (
                                        <div key={activity.id} className="flex items-center justify-between p-4 rounded-3xl bg-card border border-border/40 hover:bg-muted/30 hover:border-primary/5 transition-all group cursor-default shadow-xs text-left">
                                            <div className="flex items-center gap-5 min-w-0">
                                                <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform', brand.bg)}>
                                                    <Icon className={cn('w-4.5 h-4.5', brand.color)} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors leading-tight">{activity.title}</p>
                                                    <div className="flex items-center gap-2.5 mt-1">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase opacity-30 tracking-wider tabular-nums">{activity.time}</span>
                                                        <div className="w-1 h-1 rounded-full bg-border" />
                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">Successfully Published</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0">
                                                <div className="hidden sm:flex flex-col items-end pr-5 border-r border-border/40">
                                                    <span className="text-sm font-black text-foreground tabular-nums">421</span>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-30">Reach</span>
                                                </div>
                                                <Link to={`/posts/${activity.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all">
                                                        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Goals & Queue */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Monthly Goal Card */}
                        <Card className="rounded-[2.5rem] border-0 bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl shadow-primary/20 overflow-hidden text-left border border-white/10">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest opacity-80 flex items-center gap-2.5">
                                    <Target className="w-4 h-4" /> Content Milestone
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-2 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-end justify-between">
                                        <h4 className="text-5xl font-black leading-none">68<span className="text-2xl opacity-40">%</span></h4>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">17 / 25 POSTS</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                        <div className="h-full bg-white transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: '68%' }}></div>
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                    <p className="text-[11px] font-medium leading-relaxed opacity-90 italic">
                                        "You're making great progress! Only 8 more posts to reach your monthly target and boost visibility."
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Visual Queue Card */}
                        <Card className="rounded-[2.5rem] border-border/60 bg-card shadow-sm overflow-hidden flex flex-col text-left">
                            <CardHeader className="p-8 pb-4 border-b border-border/30 bg-muted/10">
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2.5">
                                    <Clock className="w-4 h-4" /> Next in Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border/30">
                                    {[
                                        { title: 'New Product Launch Visual', platform: 'instagram', date: 'Feb 24, 10:00 AM' },
                                        { title: 'Community Feedback Loop', platform: 'twitter', date: 'Feb 24, 02:30 PM' },
                                        { title: 'Weekly Recap Newsletter', platform: 'linkedin', date: 'Feb 25, 09:00 AM' },
                                    ].map((item, i) => {
                                        const brand = getPlatformBrand(item.platform);
                                        const Icon = getPlatformIcon(item.platform);
                                        return (
                                            <div key={i} className="p-6 hover:bg-muted/20 transition-all flex items-center justify-between gap-4 cursor-pointer group">
                                                <div className="min-w-0 space-y-1">
                                                    <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{item.title}</p>
                                                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-wider">{item.date}</p>
                                                </div>
                                                <div className={cn('w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-transparent transition-transform group-hover:scale-110', brand.bg)}>
                                                    <Icon className={cn('w-4 h-4', brand.color)} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                            <div className="p-5 bg-muted/10 border-t border-border/30">
                                <Link to="/posts">
                                    <Button variant="ghost" className="w-full rounded-2xl h-11 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:bg-muted/50 gap-2 hover:text-foreground transition-all">
                                        Open Calendar Queue <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
