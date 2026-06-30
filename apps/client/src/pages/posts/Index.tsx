import * as React from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Plus,
    MoreHorizontal,
    Check,
    Clock,
    Type,
    XCircle,
    Zap,
    LayoutGrid,
    List,
    Edit2,
    BarChart2,
    Trash2,
    ArrowUpRight,
    Image as ImageIcon,
    Video,
    FileText,
} from "lucide-react";
import {
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
} from "@/components/SocialIcons";

import { AppLayout } from "@/layouts/AppLayout";
import {
    Button,
    Input,
    Badge,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/core";
import { cn } from "@/lib/utils";
import { mockPosts } from "@/mocks";
import { useTitle } from "@/hooks/use-title";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getStatusConfig = (status: string) => {
    switch (status) {
        case "published":
            return {
                color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
                dot: "bg-emerald-500",
                icon: Check,
                label: "Published",
            };
        case "scheduled":
            return {
                color: "bg-accent/10 text-accent border-accent/20",
                dot: "bg-accent",
                icon: Clock,
                label: "Scheduled",
            };
        case "draft":
            return {
                color: "bg-muted text-muted-foreground border-border",
                dot: "bg-muted-foreground/40",
                icon: Type,
                label: "Draft",
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
    switch (platform) {
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

const getTypeIcon = (type: string) => {
    switch (type) {
        case "image":  return ImageIcon;
        case "video":  return Video;
        case "text":   return FileText;
        default:       return FileText;
    }
};

// ─── Status pill filter ──────────────────────────────────────────────────────

const STATUS_FILTERS = [
    { key: null,          label: "All" },
    { key: "published",   label: "Published" },
    { key: "scheduled",   label: "Scheduled" },
    { key: "draft",       label: "Draft" },
] as const;

// ─── Platform icon stack ─────────────────────────────────────────────────────

const PlatformStack: React.FC<{ platforms: string[]; size?: "sm" | "md" }> = ({
    platforms,
    size = "md",
}) => {
    const dim = size === "sm" ? "w-6 h-6" : "w-7 h-7";
    const icon = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
    return (
        <div className="flex -space-x-2">
            {platforms.map((p) => {
                const brand = getPlatformBrand(p);
                const Icon = brand.icon;
                return (
                    <div
                        key={p}
                        title={p}
                        className={cn(
                            dim,
                            "rounded-full border-2 border-background flex items-center justify-center shadow-sm shrink-0",
                            brand.bg
                        )}
                    >
                        <Icon className={cn(icon, brand.color)} />
                    </div>
                );
            })}
        </div>
    );
};

// ─── Post action menu ─────────────────────────────────────────────────────────

const PostActions: React.FC<{ id: number }> = ({ id }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-muted opacity-0 group-hover:opacity-100 transition-all"
            >
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 rounded-xl border-border bg-card shadow-xl p-1.5">
            <Link to={`/posts/${id}/edit`}>
                <DropdownMenuItem className="gap-2.5 py-2.5 rounded-lg cursor-pointer text-[11px] font-bold uppercase tracking-wide">
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" /> Edit
                </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="gap-2.5 py-2.5 rounded-lg cursor-pointer text-[11px] font-bold uppercase tracking-wide">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-500" /> Insights
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-border/60" />
            <DropdownMenuItem className="gap-2.5 py-2.5 rounded-lg cursor-pointer text-[11px] font-bold uppercase tracking-wide text-rose-500 focus:text-rose-500 hover:bg-rose-500/8">
                <Trash2 className="w-3.5 h-3.5" /> Delete
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

// ─── Grid card ───────────────────────────────────────────────────────────────

const GridCard: React.FC<{ post: (typeof mockPosts)[0] }> = ({ post }) => {
    const status = getStatusConfig(post.status);
    const StatusIcon = status.icon;
    const TypeIcon = getTypeIcon(post.type);

    return (
        <div className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/5 text-left">
            {/* Card header */}
            <div className="p-5 flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center border border-border/50 shrink-0">
                    <TypeIcon className="w-4.5 h-4.5 text-muted-foreground/60" />
                </div>

                <Badge
                    variant="outline"
                    className={cn(
                        "rounded-full text-[10px] font-black uppercase px-3 py-1 border flex items-center gap-1.5 shrink-0",
                        status.color
                    )}
                >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                </Badge>
            </div>

            {/* Content */}
            <div className="px-5 pb-5 flex-1 space-y-2">
                <h3 className="font-bold text-sm leading-snug text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                    {post.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {post.content}
                </p>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-border/40 bg-muted/20 flex items-center justify-between gap-3">
                <PlatformStack platforms={post.platforms} />

                <div className="flex items-center gap-2 ml-auto">
                    {post.status === "published" && (
                        <div className="text-right">
                            <p className="text-xs font-black text-foreground tabular-nums leading-none">{post.reach}</p>
                            <p className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest mt-0.5">reach</p>
                        </div>
                    )}
                    <PostActions id={post.id} />
                    <Link to={`/posts/${post.id}`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-muted"
                        >
                            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

// ─── List row ─────────────────────────────────────────────────────────────────

const ListRow: React.FC<{ post: (typeof mockPosts)[0] }> = ({ post }) => {
    const status = getStatusConfig(post.status);
    const StatusIcon = status.icon;
    const TypeIcon = getTypeIcon(post.type);

    return (
        <tr className="group border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
            {/* Title */}
            <td className="py-3.5 pl-5 pr-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center shrink-0">
                        <TypeIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate max-w-[240px] group-hover:text-accent transition-colors">
                            {post.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider mt-0.5">
                            {post.created_at}
                        </p>
                    </div>
                </div>
            </td>

            {/* Platforms */}
            <td className="py-3.5 px-3">
                <PlatformStack platforms={post.platforms} size="sm" />
            </td>

            {/* Status */}
            <td className="py-3.5 px-3">
                <Badge
                    variant="outline"
                    className={cn(
                        "rounded-full text-[10px] font-black uppercase px-3 py-1 border inline-flex items-center gap-1.5",
                        status.color
                    )}
                >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                </Badge>
            </td>

            {/* Performance */}
            <td className="py-3.5 px-3">
                {post.status === "published" ? (
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-xs font-black text-foreground tabular-nums">{post.reach}</p>
                            <p className="text-[9px] uppercase font-black text-muted-foreground/50 tracking-widest">reach</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-foreground tabular-nums">{post.engagement}</p>
                            <p className="text-[9px] uppercase font-black text-muted-foreground/50 tracking-widest">eng.</p>
                        </div>
                    </div>
                ) : (
                    <span className="text-[10px] text-muted-foreground/30 font-bold">—</span>
                )}
            </td>

            {/* Actions */}
            <td className="py-3.5 pl-3 pr-5">
                <div className="flex items-center justify-end gap-1">
                    <Link to={`/posts/${post.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-muted opacity-0 group-hover:opacity-100 transition-all">
                            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                    </Link>
                    <PostActions id={post.id} />
                </div>
            </td>
        </tr>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const PostsIndex: React.FC = () => {
    useTitle("Posts");

    const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

    const breadcrumbs = [{ title: "Posts", href: "/posts" }];

    const filteredPosts = mockPosts.filter((post) => {
        const matchesSearch = (post.title || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const counts = {
        all:       mockPosts.length,
        published: mockPosts.filter((p) => p.status === "published").length,
        scheduled: mockPosts.filter((p) => p.status === "scheduled").length,
        draft:     mockPosts.filter((p) => p.status === "draft").length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto pb-20 animate-in fade-in duration-500 slide-in-from-bottom-2">

                {/* ── Page header ─────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground">Posts</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Manage and distribute your content across channels.
                        </p>
                    </div>

                    <Link to="/posts/create">
                        <Button
                            variant="accent"
                            className="rounded-xl h-9 px-5 gap-2 text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                        >
                            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                            New Post
                        </Button>
                    </Link>
                </div>

                {/* ── Stat strip ──────────────────────────────────────────── */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Total",     value: counts.all,       accent: false },
                        { label: "Published", value: counts.published,  accent: false, dot: "bg-emerald-500" },
                        { label: "Scheduled", value: counts.scheduled,  accent: false, dot: "bg-accent" },
                        { label: "Drafts",    value: counts.draft,      accent: false, dot: "bg-muted-foreground/40" },
                    ].map(({ label, value, dot }) => (
                        <div
                            key={label}
                            className="bg-card border border-border/60 rounded-xl px-4 py-3 flex items-center justify-between gap-2"
                        >
                            <div className="flex items-center gap-2">
                                {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />}
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    {label}
                                </span>
                            </div>
                            <span className="text-lg font-black text-foreground tabular-nums">{value}</span>
                        </div>
                    ))}
                </div>

                {/* ── Toolbar ─────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 w-full sm:max-w-sm group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 group-focus-within:text-accent transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search posts…"
                            className="pl-10 h-9 rounded-xl bg-card border-border/60 text-sm focus-visible:ring-accent/20 focus-visible:border-accent/40 transition-all"
                        />
                    </div>

                    {/* Status pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {STATUS_FILTERS.map(({ key, label }) => {
                            const active = statusFilter === key;
                            return (
                                <button
                                    key={label}
                                    onClick={() => setStatusFilter(key)}
                                    className={cn(
                                        "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                        active
                                            ? "bg-foreground text-background border-foreground"
                                            : "bg-card border-border/60 text-muted-foreground/60 hover:text-foreground hover:border-border"
                                    )}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center gap-0.5 p-1 bg-muted/50 rounded-xl border border-border/50 ml-auto shrink-0">
                        {(["grid", "list"] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    viewMode === mode
                                        ? "bg-card text-foreground shadow-sm"
                                        : "text-muted-foreground/50 hover:text-foreground"
                                )}
                            >
                                {mode === "grid"
                                    ? <LayoutGrid className="w-3.5 h-3.5" />
                                    : <List className="w-3.5 h-3.5" />
                                }
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Content ─────────────────────────────────────────────── */}
                {filteredPosts.length > 0 ? (
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPosts.map((post) => (
                                <GridCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border/60 bg-muted/30">
                                            <th className="py-3 pl-5 pr-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Post</th>
                                            <th className="py-3 px-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Channels</th>
                                            <th className="py-3 px-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Status</th>
                                            <th className="py-3 px-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Performance</th>
                                            <th className="py-3 pl-3 pr-5" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPosts.map((post) => (
                                            <ListRow key={post.id} post={post} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    /* ── Empty state ─────────────────────────────────────── */
                    <div className="py-24 text-center space-y-6 animate-in fade-in zoom-in-95 duration-400">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto">
                            <FileText className="w-7 h-7 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-foreground tracking-tight">No posts found</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                                No posts match your current filters.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <Button
                                variant="outline"
                                className="rounded-xl h-9 px-5 text-[11px] font-black uppercase tracking-widest border-border"
                                onClick={() => { setSearchQuery(""); setStatusFilter(null); }}
                            >
                                Clear filters
                            </Button>
                            <Link to="/posts/create">
                                <Button
                                    variant="accent"
                                    className="rounded-xl h-9 px-5 gap-2 text-[11px] font-black uppercase tracking-widest"
                                >
                                    <Plus className="w-3.5 h-3.5 stroke-[3px]" /> New Post
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default PostsIndex;
