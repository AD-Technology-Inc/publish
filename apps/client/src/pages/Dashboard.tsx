import * as React from "react";
import { Link } from "react-router-dom";
import {
    Plus,
    TrendingUp,
    TrendingDown,
    Clock,
    Target,
    ChevronRight,
    ExternalLink,
    Zap,
    ArrowUpRight,
} from "lucide-react";
import {
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
} from "@/components/SocialIcons";
import { AppLayout } from "@/layouts/AppLayout";
import { Button, Badge } from "@/components/ui/core";
import { cn } from "@/lib/utils";
import { mockUser, mockRecentActivities, mockDashboardStats } from "@/mocks";
import { useTitle } from "@/hooks/use-title";

/* ─── Platform helpers ───────────────────────────────────────── */
const getPlatformIcon = (provider: string) => {
    switch (provider) {
        case "facebook":
            return Facebook;
        case "instagram":
            return Instagram;
        case "twitter":
            return Twitter;
        case "linkedin":
            return Linkedin;
        default:
            return Zap;
    }
};

const getPlatformBrand = (provider: string) => {
    switch (provider) {
        case "facebook":
            return {
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
            };
        case "instagram":
            return {
                color: "text-pink-500",
                bg: "bg-pink-500/10",
                border: "border-pink-500/20",
            };
        case "twitter":
            return {
                color: "text-sky-400",
                bg: "bg-sky-400/10",
                border: "border-sky-400/20",
            };
        case "linkedin":
            return {
                color: "text-blue-600",
                bg: "bg-blue-600/10",
                border: "border-blue-600/20",
            };
        default:
            return {
                color: "text-muted-foreground",
                bg: "bg-muted",
                border: "border-border",
            };
    }
};

/* ─── Sparkline ──────────────────────────────────────────────── */
const BAR_DATA = [40, 55, 35, 70, 50, 85, 60, 90, 45, 75, 95, 55, 80, 100];

const Sparkline: React.FC = () => {
    const [hovered, setHovered] = React.useState<number | null>(null);

    return (
        <div className="h-[200px] w-full flex items-end gap-1.5 px-1">
            {BAR_DATA.map((pct, i) => (
                <div
                    key={i}
                    className="flex-1 relative group flex flex-col justify-end"
                    style={{ height: "100%" }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                >
                    {/* Tooltip */}
                    {hovered === i && (
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black py-1 px-2.5 rounded-lg whitespace-nowrap shadow-xl z-20 pointer-events-none">
                            {Math.round(pct * 12.5).toLocaleString()} reach
                        </div>
                    )}
                    {/* Bar */}
                    <div
                        className={cn(
                            "w-full rounded-t-lg transition-all duration-300",
                            i === BAR_DATA.length - 1
                                ? "bg-accent"
                                : hovered === i
                                  ? "bg-accent/60"
                                  : "bg-muted-foreground/10 hover:bg-accent/30",
                        )}
                        style={{ height: `${pct}%` }}
                    />
                </div>
            ))}
        </div>
    );
};

/* ─── Stat card ──────────────────────────────────────────────── */
interface StatCardProps {
    label: string;
    value: string;
    change: string;
    icon: React.ElementType;
    color: string;
    bg: string;
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    icon: Icon,
    color,
    bg,
}) => {
    const isPositive = change.startsWith("+");
    return (
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:border-accent/20 transition-all duration-300 group text-left">
            <div className="flex items-center justify-between">
                <div
                    className={cn(
                        "p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110",
                        bg,
                    )}
                >
                    <Icon className={cn("w-4 h-4", color)} />
                </div>
                <span
                    className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-black rounded-full px-2.5 py-1 border",
                        isPositive
                            ? "text-emerald-500 bg-emerald-500/8 border-emerald-500/15"
                            : "text-red-500 bg-red-500/8 border-red-500/15",
                    )}
                >
                    {isPositive ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                    ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                    )}
                    {change}
                </span>
            </div>
            <div className="space-y-0.5">
                <p className="text-2xl font-black tracking-tight text-foreground tabular-nums">
                    {value}
                </p>
                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
                    {label}
                </p>
            </div>
        </div>
    );
};

/* ─── Dashboard ──────────────────────────────────────────────── */
export const Dashboard: React.FC = () => {
    useTitle("Dashboard");
    const user = mockUser;

    const connections = [
        { id: 1, provider: "instagram" as const, name: "@adpublish" },
        { id: 2, provider: "facebook" as const, name: "AD. Publish Page" },
    ];

    const queued = [
        {
            title: "New Product Launch Visual",
            platform: "instagram",
            date: "Today, 10:00 AM",
        },
        {
            title: "Community Feedback Loop",
            platform: "twitter",
            date: "Today, 2:30 PM",
        },
        {
            title: "Weekly Recap Newsletter",
            platform: "linkedin",
            date: "Tomorrow, 9:00 AM",
        },
    ];

    const breadcrumbs = [{ title: "Dashboard", href: "/dashboard" }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-8 p-6 max-w-7xl w-full mx-auto pb-20 animate-in fade-in duration-500 slide-in-from-bottom-3">
                {/* ── Header ────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 text-left">
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            Good morning,{" "}
                            <span className="text-accent">
                                {user.name.split(" ")[0]}
                            </span>
                        </h1>
                        <div className="flex items-center gap-2.5">
                            <div className="flex -space-x-1.5">
                                {connections.map((c) => {
                                    const brand = getPlatformBrand(c.provider);
                                    const Icon = getPlatformIcon(c.provider);
                                    return (
                                        <div
                                            key={c.id}
                                            className={cn(
                                                "w-5 h-5 rounded-full border-2 border-background flex items-center justify-center shadow-sm",
                                                brand.bg,
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "w-2.5 h-2.5",
                                                    brand.color,
                                                )}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                {connections.length} channels connected
                            </span>
                        </div>
                    </div>

                    <Link to="/posts/create">
                        <Button
                            variant="accent"
                            className="rounded-2xl px-6 h-11 gap-2 font-bold transition-transform active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
                            New post
                        </Button>
                    </Link>
                </div>

                {/* ── Main grid ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left column */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Stat cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {mockDashboardStats.map((stat) => (
                                <StatCard key={stat.label} {...stat} />
                            ))}
                        </div>

                        {/* Engagement chart */}
                        <div className="rounded-2xl border border-border bg-card p-6 text-left space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h2 className="text-sm font-bold text-foreground">
                                        Engagement Velocity
                                    </h2>
                                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                        Last 14 days · Reach
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-500/8 border border-emerald-500/15 rounded-full px-2.5 py-1">
                                    <ArrowUpRight className="w-3 h-3" />
                                    +18.2% vs prev
                                </div>
                            </div>

                            <Sparkline />

                            <div className="flex justify-between pt-4 border-t border-border/50 text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
                                <span>Feb 17</span>
                                <span>Today</span>
                            </div>
                        </div>

                        {/* Activity feed */}
                        <div className="space-y-3 text-left">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                                    Recent Activity
                                </h2>
                                <Link
                                    to="/posts"
                                    className="text-[10px] font-black uppercase tracking-widest text-accent hover:opacity-80 transition-opacity"
                                >
                                    View all
                                </Link>
                            </div>

                            <div className="space-y-2">
                                {mockRecentActivities.map((activity) => {
                                    const brand = getPlatformBrand(
                                        activity.platform.toLowerCase(),
                                    );
                                    const Icon = getPlatformIcon(
                                        activity.platform.toLowerCase(),
                                    );
                                    return (
                                        <div
                                            key={activity.id}
                                            className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-border bg-card hover:border-accent/20 hover:bg-muted/20 transition-all group cursor-default"
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0">
                                                <div
                                                    className={cn(
                                                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105",
                                                        brand.bg,
                                                        brand.border,
                                                    )}
                                                >
                                                    <Icon
                                                        className={cn(
                                                            "w-4 h-4",
                                                            brand.color,
                                                        )}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                                                        {activity.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-medium text-muted-foreground/40 tabular-nums">
                                                            {activity.time}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                        <span className="text-[10px] font-bold text-emerald-500">
                                                            Published
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="hidden sm:flex flex-col items-end pr-4 border-r border-border/50">
                                                    <span className="text-sm font-black text-foreground tabular-nums">
                                                        421
                                                    </span>
                                                    <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest">
                                                        Reach
                                                    </span>
                                                </div>
                                                <Link
                                                    to={`/posts/${activity.id}`}
                                                >
                                                    <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-transparent hover:border-border hover:bg-muted transition-all text-muted-foreground/40 hover:text-foreground">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Monthly milestone card */}
                        <div className="rounded-2xl border border-border bg-card text-left">
                            <div className="p-6 space-y-5">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent">
                                    <Target className="w-3.5 h-3.5" />
                                    Monthly milestone
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-4xl font-black leading-none text-foreground">
                                            68
                                            <span className="text-lg text-muted-foreground/40">
                                                %
                                            </span>
                                        </span>
                                        <span className="text-[11px] font-black text-muted-foreground/40">
                                            17 / 25 posts
                                        </span>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-accent transition-all duration-1000"
                                            style={{ width: "68%" }}
                                        />
                                    </div>
                                </div>

                                <p className="text-[11px] font-medium leading-relaxed text-muted-foreground/50">
                                    8 more posts to hit your monthly target and
                                    maximize channel reach.
                                </p>
                            </div>
                        </div>

                        {/* Scheduled queue */}
                        <div className="rounded-2xl border border-border bg-card overflow-hidden text-left">
                            <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                                    <Clock className="w-3.5 h-3.5" />
                                    Next in queue
                                </div>
                            </div>

                            <div className="divide-y divide-border/40">
                                {queued.map((item, i) => {
                                    const brand = getPlatformBrand(
                                        item.platform,
                                    );
                                    const Icon = getPlatformIcon(item.platform);
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-muted/20 transition-colors group cursor-pointer"
                                        >
                                            <div className="min-w-0 space-y-0.5">
                                                <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                                                    {item.title}
                                                </p>
                                                <p className="text-[10px] font-black text-muted-foreground/35 uppercase tracking-wider">
                                                    {item.date}
                                                </p>
                                            </div>
                                            <div
                                                className={cn(
                                                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110",
                                                    brand.bg,
                                                    brand.border,
                                                )}
                                            >
                                                <Icon
                                                    className={cn(
                                                        "w-3.5 h-3.5",
                                                        brand.color,
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="px-4 py-3 border-t border-border/40 bg-muted/10">
                                <Link to="/posts">
                                    <button className="w-full h-9 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all flex items-center justify-center gap-1.5">
                                        Open calendar queue
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* System status */}
                        <div className="rounded-2xl border border-border bg-card px-5 py-4 flex items-center justify-between text-left">
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold text-foreground">
                                    System status
                                </p>
                                <p className="text-[10px] font-medium text-muted-foreground/40">
                                    All pipelines operational
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="text-[9px] font-black rounded-full border-emerald-500/20 text-emerald-500 bg-emerald-500/8 px-2.5 py-1 gap-1.5 flex items-center"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Operational
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
