import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ChevronLeft, 
    Globe, 
    Calendar, 
    Layers,
    Share2
} from 'lucide-react';
import { Instagram, Twitter, Linkedin, Facebook } from '@/components/SocialIcons';
import { AppLayout } from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTitle } from '@/hooks/use-title';
import { postsApi } from '@/api/client';
import type { Post } from '@/api/types';

const getPlatformIcon = (id: string) => {
    switch (id?.toLowerCase()) {
        case 'instagram': return Instagram;
        case 'twitter': return Twitter;
        case 'facebook': return Facebook;
        case 'linkedin': return Linkedin;
        default: return Globe;
    }
};

const getBrandColor = (id: string) => {
    switch (id?.toLowerCase()) {
        case 'instagram': return 'text-pink-600 bg-pink-50 dark:bg-pink-950/30';
        case 'twitter': return 'text-sky-500 bg-sky-50 dark:bg-sky-950/30';
        case 'facebook': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
        case 'linkedin': return 'text-blue-700 bg-indigo-50 dark:bg-indigo-950/30';
        default: return 'text-primary bg-primary/10';
    }
};

export const PostShow: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    useTitle('Post Details');

    const [post, setPost] = React.useState<Post | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        postsApi.list()
            .then((list) => {
                const found = list.find((p) => p.id === id || p.job_id === id);
                if (found) {
                    setPost(found);
                } else if (list.length > 0) {
                    setPost(list[0]);
                }
            })
            .catch(() => setPost(null))
            .finally(() => setLoading(false));
    }, [id]);

    const breadcrumbs = [
        { title: 'Posts', href: '/posts' },
        { title: 'Post Details', href: `/posts/${id}` },
    ];

    const provider = post?.provider || 'facebook';
    const PlatformIcon = getPlatformIcon(provider);
    const brandColor = getBrandColor(provider);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-8 p-6 max-w-7xl w-full mx-auto pb-20 animate-in fade-in duration-700 slide-in-from-bottom-4">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between text-left">
                    <div className="flex items-center gap-4">
                        <Link to="/posts">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-card border border-border shadow-sm hover:bg-muted transition-all">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black tracking-tight text-foreground">Publish Operation</h1>
                            <div className="flex items-center gap-3">
                                <Badge variant={post?.status === 'completed' || post?.status === 'published' ? 'success' : 'secondary'} className="rounded-full px-3 py-0.5 font-bold text-[10px] uppercase">
                                    {post?.status || 'Processing'}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-mono">Job ID: {post?.job_id || id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {!post ? (
                    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
                        <Layers className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                        <h3 className="text-base font-bold text-foreground">Post not found</h3>
                        <p className="text-xs text-muted-foreground">The requested job or post record was not found.</p>
                        <Link to="/posts">
                            <Button className="rounded-xl mt-2 font-bold text-xs">Back to Posts</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                        {/* Main post preview */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="rounded-2xl border-border bg-card">
                                <CardHeader className="border-b border-border/50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", brandColor)}>
                                            <PlatformIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold capitalize">{post.provider} Publish</CardTitle>
                                            <p className="text-xs text-muted-foreground">Target Page: {post.page_id}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                            {post.message}
                                        </p>
                                    </div>

                                    {post.media_url && (
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Media URL</span>
                                            <p className="text-xs font-mono text-primary truncate">{post.media_url}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Metadata card */}
                        <div className="space-y-6">
                            <Card className="rounded-2xl border-border bg-card">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold">Execution Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-xs">
                                    <div className="flex justify-between py-2 border-b border-border/40">
                                        <span className="text-muted-foreground font-semibold">Status</span>
                                        <span className="font-bold uppercase text-[10px]">{post.status}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-border/40">
                                        <span className="text-muted-foreground font-semibold">Channel</span>
                                        <span className="font-bold capitalize">{post.provider}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-border/40">
                                        <span className="text-muted-foreground font-semibold">Page ID</span>
                                        <span className="font-mono">{post.page_id}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground font-semibold">Created At</span>
                                        <span>{post.created_at || 'Recently'}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default PostShow;
