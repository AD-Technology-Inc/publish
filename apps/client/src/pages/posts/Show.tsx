import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ChevronLeft, 
    Edit2, 
    BarChart2, 
    Calendar, 
    Globe, 
    History, 
    MessageSquare, 
    Heart, 
    Eye,
    Zap
} from 'lucide-react';
import { Instagram, Twitter, Linkedin, Facebook } from '@/components/SocialIcons';
import { AppLayout } from '@/layouts/AppLayout';
import { 
    Button, 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription,
    Badge 
} from '@/components/ui/core';
import { cn } from '@/lib/utils';
import { useTitle } from '@/hooks/use-title';

const getPlatformIcon = (id: string) => {
    switch (id) {
        case 'instagram': return Instagram;
        case 'twitter': return Twitter;
        case 'facebook': return Facebook;
        case 'linkedin': return Linkedin;
        default: return Globe;
    }
};

const getBrandColor = (id: string) => {
    switch (id) {
        case 'instagram': return 'text-pink-600 bg-pink-50 dark:bg-pink-950/30';
        case 'twitter': return 'text-sky-500 bg-sky-50 dark:bg-sky-950/30';
        case 'facebook': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
        case 'linkedin': return 'text-blue-700 bg-indigo-50 dark:bg-indigo-950/30';
        default: return 'text-primary bg-primary/10';
    }
}

export const PostShow: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    useTitle('Post Details');

    // Mock Data mimicking the original Show.vue
    const post = {
        id: id || '1',
        title: 'Launch Announcement',
        content: 'We are excited to announce the launch of our new Social Post Manager! 🚀 Manage all your social media channels from one place with advanced analytics and AI-powered content generation. #socialmedia #saas #launch #productivity',
        type: 'text',
        status: 'published',
        platforms: [
            { id: 'instagram', name: 'Instagram', status: 'success', link: '#', likes: '425', comments: '32' },
            { id: 'twitter', name: 'X (Twitter)', status: 'success', link: '#', likes: '128', comments: '14' },
            { id: 'linkedin', name: 'LinkedIn', status: 'success', link: '#', likes: '89', comments: '7' }
        ],
        created_at: '2026-02-27 10:00:00',
        published_at: '2026-02-27 10:05:00',
        engagement: '1.2k',
        reach: '8.4k',
        impressions: '12.5k'
    };

    const breadcrumbs = [
        { title: 'Posts', href: '/posts' },
        { title: 'Post Details', href: `/posts/${id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-8 p-6 max-w-7xl w-full mx-auto pb-20 animate-in fade-in duration-700 slide-in-from-bottom-4">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between text-left">
                    <div className="flex items-center gap-6">
                        <Link to="/posts">
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-card border border-border shadow-sm hover:bg-muted transition-all">
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight text-foreground">{post.title}</h1>
                            <div className="flex items-center gap-3 mt-1.5">
                                <Badge variant="success" className="rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-widest border-emerald-500/20">Published</Badge>
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">System ID: #{post.id}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/posts/analytics">
                            <Button variant="outline" className="h-12 px-6 bg-card border border-border shadow-sm rounded-2xl font-bold gap-2 active:scale-95 transition-all outline-none">
                                <BarChart2 className="w-4 h-4 opacity-70" />
                                Full Analysis
                            </Button>
                        </Link>
                        <Button variant="accent" className="h-12 px-8 rounded-2xl shadow-lg shadow-accent/15 font-bold gap-2 active:scale-95 transition-all outline-none">
                            <Edit2 className="w-4 h-4" />
                            Edit Publication
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="rounded-[2.5rem] border-border/60 bg-card shadow-sm overflow-hidden text-left border">
                            <CardHeader className="p-8 border-b border-border/10 bg-muted/10">
                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Content Core</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-10 whitespace-pre-wrap text-xl leading-relaxed text-foreground font-medium italic">
                                    "{post.content}"
                                </div>
                                <div className="px-10 py-8 bg-muted/5 border-t border-border/20 flex flex-wrap gap-3">
                                    {['socialmedia', 'saas', 'launch', 'productivity'].map(tag => (
                                        <Badge key={tag} variant="secondary" className="rounded-full bg-card border border-border/60 text-muted-foreground px-4 py-2 font-bold text-[10px] uppercase tracking-widest hover:bg-muted transition-colors">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Ecosystem Distribution</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {post.platforms.map(platform => {
                                    const Icon = getPlatformIcon(platform.id);
                                    const colors = getBrandColor(platform.id);
                                    return (
                                        <Card key={platform.id} className="rounded-3xl border-border/60 bg-card hover:bg-muted/10 transition-all group overflow-hidden border shadow-xs">
                                            <CardContent className="p-6 space-y-6 text-left">
                                                <div className="flex items-center justify-between">
                                                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500 border border-transparent', colors)}>
                                                        <Icon className="w-6 h-6 stroke-[2.5px]" />
                                                    </div>
                                                    <Badge variant="success" className="h-6 text-[9px] font-black rounded-full uppercase tracking-widest px-3 bg-emerald-500/10 text-emerald-600 border-0">Live</Badge>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-extrabold text-sm text-foreground">{platform.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Success Phase</p>
                                                </div>
                                                <div className="flex items-center justify-between pt-5 border-t border-border/20">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-xs font-black text-foreground tabular-nums">
                                                            <Heart className="w-4 h-4 text-rose-500" /> {platform.likes}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-black text-foreground tabular-nums">
                                                            <MessageSquare className="w-4 h-4 text-primary" /> {platform.comments}
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-card border border-transparent hover:border-border transition-all">
                                                        <Eye className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Meta/Stats Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="rounded-[2.5rem] border-border/60 bg-card shadow-lg text-left overflow-hidden border">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-60">Impact Statistics</CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground/30">Aggregated performance</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Impressions</p>
                                        <p className="text-3xl font-black text-foreground tracking-tight tabular-nums">{post.impressions}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Total Reach</p>
                                        <p className="text-3xl font-black text-foreground tracking-tight tabular-nums">{post.reach}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Engagement</p>
                                        <p className="text-3xl font-black text-foreground tracking-tight tabular-nums">{post.engagement}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Impact Rate</p>
                                        <p className="text-3xl font-black text-emerald-500 tracking-tight tabular-nums">4.8%</p>
                                    </div>
                                </div>
                                <Button variant="ghost" className="w-full rounded-2xl border-0 bg-accent/5 hover:bg-accent/10 h-14 font-black text-[10px] uppercase tracking-[0.2em] text-accent transition-all shadow-none">
                                    Full Insights Console
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-border/60 bg-card shadow-sm text-left border overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-accent" /> Publication Metadata
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-8">
                                <div className="flex items-start gap-4 group">
                                    <div className="w-11 h-11 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0 transition-colors group-hover:bg-accent/5 group-hover:text-accent group-hover:border-accent/20">
                                        <Calendar className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-40">Composition Date</p>
                                        <p className="text-sm font-bold text-foreground">{post.created_at}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <div className="w-11 h-11 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0 transition-colors group-hover:bg-accent/5 group-hover:text-accent group-hover:border-accent/20">
                                        <History className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-40">Distribution Sync</p>
                                        <p className="text-sm font-bold text-foreground">{post.published_at}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <div className="w-11 h-11 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0 transition-colors group-hover:bg-accent/5 group-hover:text-accent group-hover:border-accent/20">
                                        <Globe className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-40">Ecosystem Visibility</p>
                                        <p className="text-sm font-black text-foreground uppercase tracking-widest text-emerald-500">Global Public</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PostShow;
