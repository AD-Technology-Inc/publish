import * as React from "react";
import { Link } from "react-router-dom";
import {
    Plus,
    TrendingUp,
    Zap,
    Layers,
    Share2,
} from "lucide-react";
import {
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
} from "@/components/SocialIcons";
import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTitle } from "@/hooks/use-title";
import { accountsApi, identityApi, postsApi } from "@/api/client";
import type { Account, Post } from "@/api/types";

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

/* ─── StatCard ───────────────────────────────────────────────── */
interface StatCardProps {
    label: string;
    value: string | number;
    change: string;
    isPositive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    isPositive,
}) => {
    return (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-left transition-all hover:border-primary/20">
            <div className="flex items-center justify-between">
                <span
                    className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-black rounded-full px-2.5 py-1 border",
                        isPositive
                            ? "text-emerald-500 bg-emerald-500/8 border-emerald-500/15"
                            : "text-muted-foreground bg-muted border-border",
                    )}
                >
                    {isPositive && <TrendingUp className="w-2.5 h-2.5" />}
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

    const [userName, setUserName] = React.useState<string>("");
    const [connections, setConnections] = React.useState<Account[]>([]);
    const [posts, setPosts] = React.useState<Post[]>([]);

    React.useEffect(() => {
        identityApi
            .me()
            .then((user) => {
                if (user && user.name) {
                    setUserName(user.name);
                }
            })
            .catch(() => {
                setUserName("");
            });

        Promise.all([
            accountsApi.list().catch(() => [] as Account[]),
            postsApi.list().catch(() => [] as Post[]),
        ]).then(([accs, postList]) => {
            setConnections(accs);
            setPosts(postList);
        });
    }, []);

    const publishedCount = posts.filter((p) => p.status === "completed" || p.status === "published").length;
    const pendingCount = posts.filter((p) => p.status === "pending" || p.status === "processing").length;

    const stats = [
        {
            label: "Connected Channels",
            value: connections.length,
            change: connections.length > 0 ? "Active" : "None",
            isPositive: connections.length > 0,
        },
        {
            label: "Published Posts",
            value: publishedCount,
            change: publishedCount > 0 ? "Live" : "0 Today",
            isPositive: publishedCount > 0,
        },
        {
            label: "Pending / Processing",
            value: pendingCount,
            change: pendingCount > 0 ? "In Stream" : "Clear",
            isPositive: pendingCount > 0,
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
                            Welcome back,{" "}
                            <span className="text-primary">{userName}</span>
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

                    <div className="flex items-center gap-3">
                        <Link to="/posts/create">
                            <Button className="rounded-2xl px-6 h-11 gap-2 font-bold transition-transform active:scale-95">
                                <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
                                New post
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* ── Main grid ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left column */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Stat cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {stats.map((stat) => (
                                <StatCard key={stat.label} {...stat} />
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="space-y-3 text-left">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                                    Recent Operations
                                </h2>
                                <Link
                                    to="/posts"
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
                                >
                                    View all
                                </Link>
                            </div>

                            {posts.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center space-y-3">
                                    <Layers className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-foreground">No operations queued</p>
                                        <p className="text-xs text-muted-foreground">
                                            Connect social accounts and create your first publish job to see real-time streaming operations.
                                        </p>
                                    </div>
                                    <Link to="/posts/create">
                                        <Button variant="outline" size="sm" className="rounded-xl mt-2 font-semibold text-xs">
                                            Compose Post
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {posts.slice(0, 5).map((post) => {
                                        const brand = getPlatformBrand(post.provider || "facebook");
                                        const Icon = getPlatformIcon(post.provider || "facebook");
                                        return (
                                            <div
                                                key={post.id || post.job_id}
                                                className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-border bg-card hover:border-primary/20 hover:bg-muted/20 transition-all group cursor-default"
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
                                                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                            {post.message || "Publish Operation"}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-bold text-muted-foreground/60">
                                                                {post.created_at || "Recent"}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground/30">•</span>
                                                            <span className="text-[10px] font-mono text-muted-foreground/40">
                                                                {post.provider} (page: {post.page_id})
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={
                                                        post.status === "completed" || post.status === "published"
                                                            ? "success"
                                                            : post.status === "processing"
                                                            ? "secondary"
                                                            : "outline"
                                                    }
                                                    className="text-[10px] font-black uppercase tracking-wider"
                                                >
                                                    {post.status || "enqueued"}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Connected channels card */}
                        <div className="rounded-2xl border border-border bg-card p-5 text-left space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Connected Accounts
                                </h3>
                                <Link to="/settings/connections" className="text-[10px] font-bold text-primary hover:underline">
                                    Manage
                                </Link>
                            </div>

                            {connections.length === 0 ? (
                                <div className="text-center py-6 space-y-2">
                                    <Share2 className="w-6 h-6 text-muted-foreground/40 mx-auto" />
                                    <p className="text-xs text-muted-foreground">No social channels linked.</p>
                                    <Link to="/settings/connections">
                                        <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold mt-1">
                                            Connect Channel
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {connections.map((c) => {
                                        const brand = getPlatformBrand(c.provider);
                                        const Icon = getPlatformIcon(c.provider);
                                        return (
                                            <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-background/50">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", brand.bg)}>
                                                        <Icon className={cn("w-3.5 h-3.5", brand.color)} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold truncate">{c.name}</p>
                                                        <p className="text-[10px] text-muted-foreground/60 truncate">{c.provider}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="success" className="text-[9px] font-bold">
                                                    {c.status}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard