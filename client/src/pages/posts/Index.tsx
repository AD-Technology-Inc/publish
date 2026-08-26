import * as React from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Plus,
    Check,
    Clock,
    Type,
    XCircle,
    Zap,
    LayoutGrid,
    List,
    Layers,
} from "lucide-react";
import {
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
} from "@/components/SocialIcons";

import { AppLayout } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTitle } from "@/hooks/use-title";
import { postsApi } from "@/api/client";
import type { Post } from "@/api/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getStatusConfig = (status: string) => {
    switch (status) {
        case "completed":
        case "published":
            return {
                color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
                dot: "bg-emerald-500",
                icon: Check,
                label: "Completed",
            };
        case "processing":
        case "scheduled":
            return {
                color: "bg-primary/10 text-primary border-primary/20",
                dot: "bg-primary",
                icon: Clock,
                label: "Processing",
            };
        case "pending":
            return {
                color: "bg-muted text-muted-foreground border-border",
                dot: "bg-muted-foreground/40",
                icon: Type,
                label: "Pending",
            };
        case "failed":
            return {
                color: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
                dot: "bg-rose-500",
                icon: XCircle,
                label: "Failed",
            };
        default:
            return {
                color: "bg-muted text-foreground border-border",
                dot: "bg-muted-foreground/40",
                icon: Zap,
                label: status,
            };
    }
};

const getPlatformBrand = (platform: string) => {
    switch (platform.toLowerCase()) {
        case "facebook":
            return { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40", icon: Facebook };
        case "instagram":
            return { color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950/40", icon: Instagram };
        case "twitter":
            return { color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/40", icon: Twitter };
        case "linkedin":
            return { color: "text-blue-700", bg: "bg-indigo-50 dark:bg-indigo-950/40", icon: Linkedin };
        default:
            return { color: "text-muted-foreground", bg: "bg-muted", icon: Zap };
    }
};

// ─── Post Item Views ─────────────────────────────────────────────────────────

const GridCard: React.FC<{ post: Post }> = ({ post }) => {
    const statusCfg = getStatusConfig(post.status || "pending");
    const StatusIcon = statusCfg.icon;
    const brand = getPlatformBrand(post.provider || "facebook");
    const PlatformIcon = brand.icon;

    return (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 text-left hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", brand.bg)}>
                    <PlatformIcon className={cn("w-4 h-4", brand.color)} />
                </div>
                <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border", statusCfg.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                </span>
            </div>

            <p className="text-sm font-medium text-foreground line-clamp-3">
                {post.message}
            </p>

            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                <span>Page: {post.page_id}</span>
                <span>{post.created_at || "Recent"}</span>
            </div>
        </div>
    );
};

const ListRow: React.FC<{ post: Post }> = ({ post }) => {
    const statusCfg = getStatusConfig(post.status || "pending");
    const StatusIcon = statusCfg.icon;
    const brand = getPlatformBrand(post.provider || "facebook");
    const PlatformIcon = brand.icon;

    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-all text-left">
            <div className="flex items-center gap-3.5 min-w-0">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", brand.bg)}>
                    <PlatformIcon className={cn("w-4 h-4", brand.color)} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                        {post.message}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        <span>{post.provider}</span>
                        <span>•</span>
                        <span>Page: {post.page_id}</span>
                        <span>•</span>
                        <span>{post.created_at || "Recent"}</span>
                    </div>
                </div>
            </div>

            <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0", statusCfg.color)}>
                <StatusIcon className="w-3 h-3" />
                {statusCfg.label}
            </span>
        </div>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const PostsIndex: React.FC = () => {
    useTitle("Posts");

    const [posts, setPosts] = React.useState<Post[]>([]);
    const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

    const breadcrumbs = [{ title: "Posts", href: "/posts" }];

    React.useEffect(() => {
        postsApi.list()
            .then(setPosts)
            .catch(() => setPosts([]));
    }, []);

    const filteredPosts = posts.filter((post) => {
        const matchesSearch = (post.message || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const counts = {
        all: posts.length,
        completed: posts.filter((p) => p.status === "completed" || p.status === "published").length,
        pending: posts.filter((p) => p.status === "pending" || p.status === "processing").length,
        failed: posts.filter((p) => p.status === "failed").length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto pb-20 animate-in fade-in duration-500 slide-in-from-bottom-2">
                {/* ── Page header ─────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground">Posts</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Manage and track asynchronous publishing jobs.
                        </p>
                    </div>

                    <Link to="/posts/create">
                        <Button className="rounded-xl h-9 px-5 gap-2 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform">
                            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                            New Post
                        </Button>
                    </Link>
                </div>

                {/* ── Stat strip ──────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { key: null, label: "Total", value: counts.all, dot: "bg-foreground" },
                        { key: "completed", label: "Completed", value: counts.completed, dot: "bg-emerald-500" },
                        { key: "pending", label: "In Flight", value: counts.pending, dot: "bg-primary" },
                        { key: "failed", label: "Failed", value: counts.failed, dot: "bg-rose-500" },
                    ].map(({ key, label, value, dot }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => setStatusFilter(statusFilter === key ? null : key)}
                            className={cn(
                                "p-4 rounded-xl border bg-card space-y-1 text-left transition-all cursor-pointer hover:border-primary/50",
                                statusFilter === key ? "border-primary ring-2 ring-primary/20" : "border-border"
                            )}
                        >
                            <div className="flex items-center gap-1.5">
                                <span className={cn("w-2 h-2 rounded-full", dot)} />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
                            </div>
                            <p className="text-xl font-black">{value}</p>
                        </button>
                    ))}
                </div>

                {/* ── Filter bar ──────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 rounded-xl h-9 text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <div className="flex items-center border border-border rounded-xl p-0.5 bg-muted/40">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn("p-1.5 rounded-lg transition-all", viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn("p-1.5 rounded-lg transition-all", viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Content ─────────────────────────────────────────────── */}
                {filteredPosts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
                        <Layers className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-foreground">No posts found</h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                {searchQuery ? "No posts match your search query." : "You haven't enqueued any posts yet. Start publishing across your connected social platforms."}
                            </p>
                        </div>
                        <Link to="/posts/create">
                            <Button className="rounded-xl mt-2 font-bold text-xs">
                                Create Post
                            </Button>
                        </Link>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPosts.map((post) => (
                            <GridCard key={post.id || post.job_id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredPosts.map((post) => (
                            <ListRow key={post.id || post.job_id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default PostsIndex;
