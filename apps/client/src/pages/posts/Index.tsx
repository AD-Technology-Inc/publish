import * as React from 'react';
import { Link } from 'react-router-dom';
import { 
    Search, 
    Plus, 
    Filter, 
    MoreHorizontal, 
    Check, 
    Clock, 
    Type, 
    XCircle, 
    Zap,
    LayoutGrid,
    List,
    ChevronDown,
    Edit2,
    BarChart2,
    Trash2,
    Eye,
    ArrowUpRight,
    Image as ImageIcon,
    Video
} from 'lucide-react';
import { Instagram, Facebook, Twitter, Linkedin } from '@/components/SocialIcons';

import { AppLayout } from '@/layouts/AppLayout';
import { 
    Button, 
    Input, 
    Card, 
    Badge,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from '@/components/ui/core';
import { cn } from '@/lib/utils';
import { mockPosts } from '@/mocks';
import { useTitle } from '@/hooks/use-title';

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'published': return { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Check, label: 'Published' };
        case 'scheduled': return { color: 'bg-accent/10 text-accent border-accent/20', icon: Clock, label: 'Scheduled' };
        case 'draft': return { color: 'bg-muted/50 text-muted-foreground border-border', icon: Type, label: 'Draft' };
        case 'failed': return { color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: XCircle, label: 'Failed' };
        default: return { color: 'bg-muted text-foreground border-border', icon: Zap, label: status };
    }
};

const getPlatformBrand = (platform: string) => {
    switch (platform) {
        case 'facebook': return { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: Facebook };
        case 'instagram': return { color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/30', icon: Instagram };
        case 'twitter': return { color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/30', icon: Twitter };
        case 'linkedin': return { color: 'text-blue-700', bg: 'bg-indigo-50 dark:bg-indigo-950/30', icon: Linkedin };
        default: return { color: 'text-muted-foreground', bg: 'bg-muted', icon: Zap };
    }
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'text': return Type;
        case 'image': return ImageIcon;
        case 'video': return Video;
        default: return Type;
    }
};

export const PostsIndex: React.FC = () => {
    useTitle('Content Feed');
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activePlatformFilter, setActivePlatformFilter] = React.useState<string | null>(null);

    const breadcrumbs = [{ title: 'Content Feed', href: '/posts' }];

    const filteredPosts = mockPosts.filter(post => {
        const title = post.title || '';
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = !activePlatformFilter || post.platforms.includes(activePlatformFilter);
        return matchesSearch && matchesPlatform;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-8 p-6 max-w-7xl w-full mx-auto pb-20 animate-in fade-in duration-700 slide-in-from-bottom-4">
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1 text-left">
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Content Feed</h1>
                        <p className="text-muted-foreground font-medium text-sm">Monitor, analyze and distribute your brand presence.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex p-1 bg-muted/50 rounded-xl border border-border/50">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={cn('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        <Link to="/posts/create">
                            <Button className="rounded-2xl px-6 h-11 gap-2 font-bold shadow-[0_20px_40px_-12px_rgba(var(--primary),0.2)] border-0 transition-transform active:scale-95">
                                <Plus className="w-4 h-4 stroke-[3px]" /> Create Post
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats & Quick Filters Row */}
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="relative flex-1 w-full group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title or content..." 
                                    className="pl-11 h-12 rounded-2xl bg-card border-border shadow-none focus-visible:ring-accent/20 transition-all text-foreground" 
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-border bg-card font-bold text-xs uppercase tracking-widest gap-2 shrink-0">
                                        <Filter className="w-4 h-4" /> Filters <ChevronDown className="w-3 h-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border bg-card p-2 shadow-2xl">
                                    <DropdownMenuItem className="rounded-xl font-bold text-[10px] uppercase tracking-widest py-3">All Content</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold text-[10px] uppercase tracking-widest py-3 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors">Published Only</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold text-[10px] uppercase tracking-widest py-3 hover:bg-accent/10 hover:text-accent transition-colors">Scheduled Posts</DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    <DropdownMenuItem className="rounded-xl font-bold text-[10px] uppercase tracking-widest py-3 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer" onClick={() => {setSearchQuery(''); setActivePlatformFilter(null);}}>Reset Filters</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {['instagram', 'facebook', 'twitter', 'linkedin'].map((p) => {
                                const brand = getPlatformBrand(p);
                                const Icon = brand.icon;
                                return (
                                    <button 
                                        key={p}
                                        onClick={() => setActivePlatformFilter(activePlatformFilter === p ? null : p)}
                                        className={cn(
                                            'flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all',
                                            activePlatformFilter === p 
                                                ? cn(brand.bg, brand.color, 'border-current/30 scale-105 shadow-md ring-2 ring-current/5')
                                                : 'border-border bg-card text-muted-foreground/60 hover:border-primary/20 hover:text-foreground'
                                        )}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:w-80">
                        <div className="bg-emerald-500/[0.03] border border-emerald-500/10 p-5 rounded-[2rem] flex flex-col justify-between group hover:bg-emerald-500/[0.06] transition-all hover:scale-105 duration-300 text-left cursor-default">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Live Posts</span>
                            <h4 className="text-3xl font-black text-foreground">124</h4>
                        </div>
                        <div className="bg-muted/30 border border-border/50 p-5 rounded-[2rem] flex flex-col justify-between group hover:bg-muted/50 transition-all hover:scale-105 duration-300 text-left cursor-default">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Drafts</span>
                            <h4 className="text-3xl font-black text-foreground">12</h4>
                        </div>
                    </div>
                </div>

                {filteredPosts.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post) => {
                                const status = getStatusConfig(post.status);
                                const StatusIcon = status.icon;
                                const TypeIcon = getTypeIcon(post.type);
                                return (
                                    <Card key={post.id} className="rounded-[2.5rem] border-border/60 bg-card hover:border-primary/20 transition-all group overflow-hidden flex flex-col shadow-sm hover:shadow-2xl hover:shadow-primary/5 duration-500">
                                        <div className="p-8 flex-1 space-y-8 text-left">
                                            <div className="flex items-center justify-between">
                                                <div className={cn('w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/50 group-hover:bg-primary/5 transition-all duration-500')}>
                                                    <TypeIcon className="w-7 h-7 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-500" />
                                                </div>
                                                <Badge variant="outline" className={cn('rounded-full text-[10px] font-black uppercase px-4 py-1.5 border shadow-none flex items-center gap-2', status.color)}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {status.label}
                                                </Badge>
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2 text-foreground">{post.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed opacity-70 font-medium">{post.content}</p>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-border/40">
                                                <div className="flex -space-x-2.5">
                                                    {post.platforms.map((p) => {
                                                        const brand = getPlatformBrand(p);
                                                        const Icon = brand.icon;
                                                        return (
                                                            <div 
                                                                key={p} 
                                                                className={cn('w-10 h-10 rounded-full border-[3.5px] border-background flex items-center justify-center group-hover:scale-110 transition-transform shadow-md ring-1 ring-border/5', brand.bg)} 
                                                                title={p}
                                                            >
                                                                <Icon className={cn('w-4.5 h-4.5', brand.color)} />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="text-right flex items-center gap-3">
                                                    {post.status === 'published' && (
                                                        <div className="space-y-0 text-right pr-2">
                                                            <p className="text-sm font-black text-foreground leading-none tabular-nums">{post.reach}</p>
                                                            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-40">Reach</p>
                                                        </div>
                                                    )}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger>
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-muted group/btn transition-all">
                                                                <MoreHorizontal className="w-5 h-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-52 rounded-2xl border-border bg-card shadow-2xl p-2.5">
                                                            <DropdownMenuItem className="gap-3 py-3.5 rounded-xl cursor-pointer font-bold text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all"><Edit2 className="w-4 h-4 text-primary" /> Edit Post</DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-3 py-3.5 rounded-xl cursor-pointer font-bold text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all"><BarChart2 className="w-4 h-4 text-emerald-500" /> Share Insights</DropdownMenuItem>
                                                            <DropdownMenuSeparator className="my-1.5 border-border/50" />
                                                            <DropdownMenuItem className="gap-3 py-3.5 rounded-xl cursor-pointer text-rose-500 focus:text-rose-500 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-500/10 transition-all"><Trash2 className="w-4 h-4" /> Move to Trash</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-8 py-5 bg-muted/10 border-t border-border/40 flex items-center justify-between group-hover:bg-primary/[0.015] transition-all">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{post.created_at}</span>
                                            <Link to={`/posts/${post.id}`}>
                                                <Button variant="ghost" size="sm" className="h-9 rounded-xl text-[10px] font-black gap-2 hover:bg-background px-4 border-transparent border hover:border-border text-foreground transition-all">
                                                    <Eye className="w-4 h-4" /> Preview
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-card border border-border/60 rounded-[2.5rem] overflow-hidden shadow-sm text-left">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-muted/20 border-b border-border/50">
                                        <tr>
                                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Content Details</th>
                                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Social Channels</th>
                                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60 text-center">Status</th>
                                            <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground/60">Performance</th>
                                            <th className="p-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {filteredPosts.map((post) => {
                                            const status = getStatusConfig(post.status);
                                            const StatusIcon = status.icon;
                                            const TypeIcon = getTypeIcon(post.type);
                                            return (
                                                <tr key={post.id} className="group hover:bg-primary/[0.01] transition-all">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-5 min-w-[340px]">
                                                            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/50 shrink-0 group-hover:scale-105 transition-transform">
                                                                <TypeIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{post.title}</p>
                                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">{post.created_at}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex -space-x-1.5">
                                                            {post.platforms.map((p) => {
                                                                const brand = getPlatformBrand(p);
                                                                const Icon = brand.icon;
                                                                return (
                                                                    <div key={p} className={cn('w-8 h-8 rounded-full border-2 border-background flex items-center justify-center shadow-sm', brand.bg)}>
                                                                        <Icon className={cn('w-3.5 h-3.5', brand.color)} />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        <Badge variant="outline" className={cn('rounded-full text-[10px] font-black uppercase px-3 py-1 border shadow-none inline-flex items-center gap-1.5', status.color)}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {status.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-6">
                                                        {post.status === 'published' ? (
                                                            <div className="flex items-center gap-6">
                                                                <div className="text-left">
                                                                    <p className="text-xs font-black text-foreground tabular-nums">{post.reach}</p>
                                                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter opacity-40 leading-none">Reach</p>
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-xs font-black text-foreground tabular-nums">{post.engagement}</p>
                                                                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter opacity-40 leading-none">Eng.</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-1 bg-muted rounded-full"></div>
                                                        )}
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link to={`/posts/${post.id}`}>
                                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 group/btn">
                                                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                                                                </Button>
                                                            </Link>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger>
                                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted group/more">
                                                                        <MoreHorizontal className="w-4 h-4 text-muted-foreground group-hover/more:text-primary" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48 rounded-2xl border-border bg-card shadow-2xl p-2">
                                                                    <DropdownMenuItem className="gap-2 py-3 rounded-xl cursor-pointer font-bold text-[10px] uppercase tracking-widest"><Edit2 className="w-3.5 h-3.5" /> Edit</DropdownMenuItem>
                                                                    <DropdownMenuItem className="gap-2 py-3 rounded-xl cursor-pointer font-bold text-[10px] uppercase tracking-widest"><BarChart2 className="w-3.5 h-3.5" /> Insights</DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="my-1 border-border/50" />
                                                                    <DropdownMenuItem className="gap-2 py-3 rounded-xl cursor-pointer text-rose-500 focus:text-rose-500 font-bold text-[10px] uppercase tracking-widest"><Trash2 className="w-3.5 h-3.5" /> Delete</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="py-32 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 rounded-[3rem] bg-muted/40 flex items-center justify-center mx-auto border border-border overflow-hidden relative group">
                             <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Search className="w-10 h-10 text-muted-foreground opacity-20 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-foreground tracking-tight">No matches found</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed">We couldn't find any posts matching your current filters or search query. Try clearing them to see everything.</p>
                        </div>
                        <Button variant="outline" className="rounded-2xl h-12 px-10 font-black text-[10px] uppercase tracking-widest border-border bg-card shadow-sm hover:bg-muted" onClick={() => {setSearchQuery(''); setActivePlatformFilter(null);}}>
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default PostsIndex;
