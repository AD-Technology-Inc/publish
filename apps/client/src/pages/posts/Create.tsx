import * as React from 'react';
import { Link } from 'react-router-dom';
import { 
    Image as ImageIcon, 
    Video, 
    Type, 
    Plus,
    X,
    Check,
    Eye,
    Globe,
    MessageSquare,
    Heart,
    Share2,
    ThumbsUp,
    MoreHorizontal,
    Clock,
    Wand2,
    PlusCircle,
    Hash,
    Link2,
    BarChart2,
    Send
} from 'lucide-react';
import { Instagram, Facebook, Twitter, Linkedin } from '@/components/SocialIcons';

import { AppLayout } from '@/layouts/AppLayout';
import { 
    Button, 
    Input, 
    Textarea,
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription,
    Badge, 
    Label,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from '@/components/ui/core';
import { cn } from '@/lib/utils';
import { useTitle } from '@/hooks/use-title';
import { usePublishPost } from '@/hooks/usePublishPost';
import { socialApi, accountsApi } from '@/api/client';
import type { Account } from '@/api/types';

const getPlatformIcon = (provider: string) => {
    switch (provider) {
        case 'facebook': return Facebook;
        case 'instagram': return Instagram;
        case 'twitter': return Twitter;
        case 'linkedin': return Linkedin;
        default: return Globe;
    }
};

const getPlatformStyle = (provider: string) => {
    return {
        facebook:  { color: 'text-blue-600',  bg: 'bg-blue-50 dark:bg-blue-950/30',   border: 'border-blue-200 dark:border-blue-800/50' },
        instagram: { color: 'text-pink-600',  bg: 'bg-pink-50 dark:bg-pink-950/30',   border: 'border-pink-200 dark:border-pink-800/50' },
        twitter:   { color: 'text-sky-500',   bg: 'bg-sky-50 dark:bg-sky-950/30',     border: 'border-sky-200 dark:border-sky-800/50' },
        linkedin:  { color: 'text-blue-700',  bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800/50' },
    }[provider] || { color: 'text-foreground', bg: 'bg-muted', border: 'border-border' };
};

export const CreatePost: React.FC = () => {
    useTitle('Compose Post');

    // Live accounts from the social-account-service
    const [accounts, setAccounts] = React.useState<Account[]>([]);
    React.useEffect(() => {
        accountsApi.list().then(setAccounts).catch(() => {
            // Gateway not running locally — show empty
            setAccounts([]);
        });
    }, []);

    // Derive a 'platform card' from each live account
    const platforms = accounts.map(acc => ({
        id: acc.id,
        name: acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1),
        provider: acc.provider,
        icon: getPlatformIcon(acc.provider),
        account: acc.name,
        page_id: acc.page_id,
        ...getPlatformStyle(acc.provider),
    }));
    
    const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);
    const [content, setContent] = React.useState('');
    const [title, setTitle] = React.useState('');
    const [postType, setPostType] = React.useState('text');
    const [tags, setTags] = React.useState<string[]>([]);
    const [newTag, setNewTag] = React.useState('');
    const [activePreviewTab, setActivePreviewTab] = React.useState('');
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);
    const [dlqJobs, setDlqJobs] = React.useState<any[]>([]);

    const { publish, isPending, isSuccess, isFailed, error, jobStatus } = usePublishPost();

    React.useEffect(() => {
        if (isSuccess) {
            setShowSuccessModal(true);
        }
    }, [isSuccess]);

    const handlePublish = () => {
        if (!selectedPlatforms.length || !content) return;
        const pId = selectedPlatforms[0];
        const platformObj = platforms.find(p => p.id === pId);
        if (!platformObj) return;
        publish({
            page_id: platformObj.page_id,
            provider: platformObj.provider,
            message: content,
            platforms: selectedPlatforms.map(id => platforms.find(p => p.id === id)?.provider ?? 'facebook'),
        });
    };

    const handleCheckDlq = async () => {
        try {
            const data = await socialApi.getDlqJobs('social-post');
            setDlqJobs(data.dlq_jobs || []);
        } catch (e) {
            console.error('Failed to fetch DLQ');
        }
    };

    const handleReplayDlq = async (msgId: string) => {
        try {
            await socialApi.replayDlqJob('social-post', msgId);
            handleCheckDlq(); // Refresh list
        } catch (e) {
            console.error('Failed to replay DLQ job');
        }
    };

    // Scheduling State
    const [scheduleDate, setScheduleDate] = React.useState('');
    const [scheduleTime, setScheduleTime] = React.useState('');

    // Auto-set active preview tab when platforms change
    React.useEffect(() => {
        if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(activePreviewTab)) {
            setActivePreviewTab(selectedPlatforms[0]);
        }
    }, [selectedPlatforms, activePreviewTab]);

    const breadcrumbs = [
        { title: 'Posts', href: '/posts' },
        { title: 'Create Post', href: '/posts/create' },
    ];

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const addTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags(prev => [...prev, newTag]);
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(prev => prev.filter(t => t !== tag));
    };

    const charCount = content.length;

    const activePreviewProvider = React.useMemo(() => {
        const targetId = activePreviewTab || selectedPlatforms[0];
        const p = platforms.find(p => p.id === targetId);
        return p?.provider || '';
    }, [activePreviewTab, selectedPlatforms]);

    const activePreviewAccount = React.useMemo(() => {
        const targetId = activePreviewTab || selectedPlatforms[0];
        const p = platforms.find(p => p.id === targetId);
        return p?.account || 'Account Name';
    }, [activePreviewTab, selectedPlatforms]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto h-full overflow-hidden text-left pb-24">
                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Compose Post</h1>
                        <p className="text-muted-foreground text-xs font-medium">Create and distribute content everywhere.</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {selectedPlatforms.length > 0 && (
                            <Dialog onOpenChange={(open) => {
                                if (open && (!activePreviewTab || !selectedPlatforms.includes(activePreviewTab))) {
                                    setActivePreviewTab(selectedPlatforms[0]);
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="bg-card border-border gap-2 h-10 px-4 font-bold rounded-xl shadow-xs">
                                        <Eye className="w-4 h-4" /> Preview Content
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-4xl rounded-[2rem] border border-border bg-card p-0 overflow-hidden shadow-2xl">
                                    <div className="flex flex-col h-[650px] bg-card text-foreground">
                                        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
                                            <div className="space-y-0.5">
                                                <h3 className="font-extrabold text-lg tracking-tight">Post Preview</h3>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">See how it looks on {activePreviewProvider}</p>
                                            </div>
                                            <div className="flex gap-1.5 p-1 bg-background rounded-xl border border-border overflow-x-auto max-w-md no-scrollbar shrink-0">
                                                {selectedPlatforms.map(pId => (
                                                    <button 
                                                        key={pId}
                                                        onClick={() => setActivePreviewTab(pId)}
                                                        className={cn(
                                                            'px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap',
                                                            (activePreviewTab || selectedPlatforms[0]) === pId ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
                                                        )}
                                                    >
                                                        {platforms.find(p => p.id === pId)?.provider}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-background/50">
                                            {/* INSTAGRAM PREVIEW */}
                                            {activePreviewProvider === 'instagram' && (
                                                <div className="w-[340px] bg-card border border-border rounded-xl h-fit shadow-lg overflow-hidden animate-in fade-in zoom-in duration-500">
                                                    <div className="p-3 flex items-center gap-2 border-b border-border/50">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                                                            <div className="w-full h-full rounded-full bg-card border-2 border-card"></div>
                                                        </div>
                                                        <span className="text-xs font-bold">{activePreviewAccount}</span>
                                                    </div>
                                                    <div className="aspect-square bg-muted flex items-center justify-center">
                                                        {postType !== 'video' ? <ImageIcon className="w-12 h-12 text-muted-foreground/20" /> : <Video className="w-12 h-12 text-muted-foreground/20" />}
                                                    </div>
                                                    <div className="p-4 space-y-3">
                                                        <div className="flex items-center gap-4">
                                                            <Heart className="w-5 h-5" /> <MessageSquare className="w-5 h-5" /> <Share2 className="w-5 h-5" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[13px] leading-relaxed">
                                                                <span className="font-bold mr-2 text-foreground">posexei</span> {content || 'Write your post...'}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {tags.map(t => <span key={t} className="text-[13px] text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">#{t}</span>)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* FACEBOOK PREVIEW */}
                                            {activePreviewProvider === 'facebook' && (
                                                <div className="w-[480px] bg-card border border-border rounded-xl h-fit shadow-lg animate-in fade-in zoom-in duration-500">
                                                    <div className="p-4 flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg shrink-0">P</div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold truncate text-foreground">{activePreviewAccount}</p>
                                                            <p className="text-[11px] text-muted-foreground font-medium">Just now · <Globe className="inline w-3 h-3 ml-0.5" /></p>
                                                        </div>
                                                        <MoreHorizontal className="w-5 h-5 text-muted-foreground opacity-50" />
                                                    </div>
                                                    <div className="px-4 pb-3">
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 font-medium">{content || 'No content yet...'}</p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {tags.map(t => <span key={t} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">#{t}</span>)}
                                                        </div>
                                                    </div>
                                                    {postType !== 'text' && (
                                                        <div className="aspect-video bg-muted border-y border-border/50 flex items-center justify-center">
                                                            {postType === 'image' ? <ImageIcon className="w-14 h-14 text-muted-foreground/20" /> : <Video className="w-14 h-14 text-muted-foreground/20" />}
                                                        </div>
                                                    )}
                                                    <div className="p-2 border-t border-border/30 flex items-center justify-around text-muted-foreground font-bold text-[11px] uppercase tracking-wider shrink-0">
                                                        <div className="flex items-center gap-2 py-2.5 px-6 hover:bg-muted rounded-xl transition-all"><ThumbsUp className="w-4 h-4" /> Like</div>
                                                        <div className="flex items-center gap-2 py-2.5 px-6 hover:bg-muted rounded-xl transition-all"><MessageSquare className="w-4 h-4" /> Comment</div>
                                                        <div className="flex items-center gap-2 py-2.5 px-6 hover:bg-muted rounded-xl transition-all"><Share2 className="w-4 h-4" /> Share</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* TWITTER / X PREVIEW */}
                                            {activePreviewProvider === 'twitter' && (
                                                <div className="w-[450px] bg-card border border-border rounded-[2rem] p-6 h-fit shadow-lg animate-in fade-in zoom-in duration-500">
                                                    <div className="flex gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-muted shrink-0 flex items-center justify-center font-black text-xl text-primary/20">P</div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-black text-[15px] truncate text-foreground">{activePreviewAccount}</span>
                                                                <span className="text-muted-foreground text-[14px]">@posexei</span>
                                                                <span className="text-muted-foreground text-[14px] shrink-0">· 1m</span>
                                                            </div>
                                                            <p className="text-[15px] mt-1.5 whitespace-pre-wrap text-foreground leading-relaxed font-medium">{content || 'What’s happening?'}</p>
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {tags.map(t => <span key={t} className="text-[15px] text-sky-500 hover:underline cursor-pointer">#{t}</span>)}
                                                            </div>
                                                            {postType !== 'text' && (
                                                                <div className="mt-4 aspect-video bg-muted rounded-2xl border border-border/60 flex items-center justify-center shadow-inner">
                                                                    {postType === 'image' ? <ImageIcon className="w-12 h-12 text-muted-foreground/20" /> : <Video className="w-12 h-12 text-muted-foreground/20" />}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-between mt-6 text-muted-foreground/60 max-w-sm">
                                                                <div className="flex items-center gap-2 group cursor-pointer hover:text-sky-500 transition-colors">
                                                                    <MessageSquare className="w-5 h-5" /> <span className="text-xs font-bold">12</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 group cursor-pointer hover:text-emerald-500 transition-colors">
                                                                    <Share2 className="w-5 h-5" /> <span className="text-xs font-bold">5</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 group cursor-pointer hover:text-pink-500 transition-colors">
                                                                    <Heart className="w-5 h-5" /> <span className="text-xs font-bold">48</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 group cursor-pointer hover:text-sky-500 transition-colors">
                                                                    <BarChart2 className="w-5 h-5" /> <span className="text-xs font-bold">1.2k</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* LINKEDIN PREVIEW */}
                                            {activePreviewProvider === 'linkedin' && (
                                                <div className="w-[460px] bg-card border border-border rounded-xl h-fit shadow-lg animate-in fade-in zoom-in duration-500 overflow-hidden">
                                                    <div className="p-4 flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center font-black text-xl text-primary/20 shrink-0">P</div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1">
                                                                <p className="text-[15px] font-bold truncate text-foreground">{activePreviewAccount}</p>
                                                                <span className="text-muted-foreground text-[12px] opacity-40">· 1st</span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Professional Distribution Lead</p>
                                                            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5 opacity-60">Just now · <Globe className="w-3 h-3" /></p>
                                                        </div>
                                                        <MoreHorizontal className="w-5 h-5 text-muted-foreground opacity-40" />
                                                    </div>
                                                    <div className="px-5 pb-5">
                                                        <p className="text-[14px] leading-relaxed text-foreground whitespace-pre-wrap font-medium">{content || 'Write your professional update...'}</p>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {tags.map(t => <span key={t} className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">#{t}</span>)}
                                                        </div>
                                                        {postType === 'link' && (
                                                            <div className="mt-4 rounded-xl border border-border overflow-hidden bg-muted/20">
                                                                <div className="aspect-video bg-muted flex items-center justify-center">
                                                                    <Link2 className="w-14 h-14 text-muted-foreground/10" />
                                                                </div>
                                                                <div className="p-4 bg-muted/30">
                                                                    <p className="font-bold text-sm text-foreground">Content Distribution Excellence - Posexei</p>
                                                                    <p className="text-[11px] text-muted-foreground font-medium">posexei.app</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {postType !== 'text' && postType !== 'link' && (
                                                        <div className="aspect-video bg-muted flex items-center justify-center border-y border-border/50">
                                                            {postType === 'image' ? <ImageIcon className="w-14 h-14 text-muted-foreground/20" /> : <Video className="w-14 h-14 text-muted-foreground/20" />}
                                                        </div>
                                                    )}
                                                    <div className="px-5 py-2 border-t border-border/30 flex items-center justify-between text-muted-foreground font-bold text-[11px] uppercase tracking-widest shrink-0">
                                                        <div className="flex items-center gap-2 py-3 px-3 hover:bg-muted rounded-lg transition-all"><ThumbsUp className="w-4.5 h-4.5" /> Like</div>
                                                        <div className="flex items-center gap-2 py-3 px-3 hover:bg-muted rounded-lg transition-all"><MessageSquare className="w-4.5 h-4.5" /> Comment</div>
                                                        <div className="flex items-center gap-2 py-3 px-3 hover:bg-muted rounded-lg transition-all"><Share2 className="w-4.5 h-4.5" /> Repost</div>
                                                        <div className="flex items-center gap-2 py-3 px-3 hover:bg-muted rounded-lg transition-all"><Send className="w-4.5 h-4.5" /> Send</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* OTHER PREVIEWS */}
                                            {(!activePreviewProvider || (activePreviewProvider !== 'instagram' && activePreviewProvider !== 'facebook' && activePreviewProvider !== 'twitter' && activePreviewProvider !== 'linkedin')) && (
                                                <div className="w-[450px] bg-card border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-6 text-foreground shadow-xl">
                                                    <div className="p-6 bg-muted rounded-full">
                                                        <Eye className="w-14 h-14 text-muted-foreground opacity-20" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-xl font-black tracking-tight">Ecosystem Preview</p>
                                                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">Full publication preview for {activePreviewProvider || 'this channel'} is generated during the distribution phase.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
 
                        <div className="h-6 w-px bg-border mx-1 opacity-50"></div>
 
                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground h-10 px-4 font-bold text-xs" onClick={() => {}}>Save Draft</Button>
                        
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="bg-card border-border h-10 w-10 rounded-xl shadow-xs" disabled={selectedPlatforms.length === 0}>
                                    <Clock className={cn('w-4 h-4 text-foreground', (scheduleDate || scheduleTime) ? 'text-primary' : '')} />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[350px] rounded-[2rem] border border-border bg-card p-8 shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="font-extrabold text-xl text-foreground">Schedule Post</DialogTitle>
                                    <DialogDescription className="text-xs font-medium">Select a future date and time for distribution.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-6 text-foreground">
                                    <div className="space-y-2">
                                        <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Publish Date</Label>
                                        <Input 
                                            id="date" 
                                            type="date" 
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            className="h-12 rounded-2xl bg-muted/50 border-border text-foreground px-4" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="time" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Time (Local)</Label>
                                        <Input 
                                            id="time" 
                                            type="time" 
                                            value={scheduleTime}
                                            onChange={(e) => setScheduleTime(e.target.value)}
                                            className="h-12 rounded-2xl bg-muted/50 border-border text-foreground px-4" 
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button className="w-full rounded-2xl font-bold h-12 shadow-lg shadow-primary/20" onClick={() => {}}>Set Publication Time</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button 
                            disabled={selectedPlatforms.length === 0 || !content || isPending} 
                            className="rounded-xl px-8 h-10 font-bold shadow-md shadow-primary/20 transition-all active:scale-95"
                            onClick={handlePublish}
                        >
                            {isPending ? 'Publishing...' : 'Publish Content'}
                        </Button>
                    </div>
                </div>

                {isFailed && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="font-bold">Publication Failed</p>
                            <p className="text-sm">{error || 'Job encountered an error or was routed to the DLQ.'}</p>
                            <p className="text-xs opacity-70 mt-1">Status: {jobStatus?.status || 'unknown'}</p>
                        </div>
                        <Button variant="outline" className="border-rose-500/50 text-rose-500 hover:bg-rose-500/10" onClick={handleCheckDlq}>
                            Check DLQ
                        </Button>
                    </div>
                )}
                
                {dlqJobs.length > 0 && (
                    <div className="bg-muted border border-border p-4 rounded-xl flex flex-col gap-2">
                        <p className="font-bold">Dead Letter Queue (Failed Jobs)</p>
                        {dlqJobs.map((job, idx) => (
                            <div key={idx} className="bg-background p-3 rounded border border-border flex items-center justify-between">
                                <div className="text-sm truncate mr-4">
                                    <span className="font-bold text-rose-500">Error:</span> {job.error} <br/>
                                    <span className="text-xs text-muted-foreground">Retries: {job.retry_count}</span>
                                </div>
                                <Button size="sm" onClick={() => handleReplayDlq(job.message_id)}>Retry Job</Button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                    {/* Composition Column */}
                    <div className="lg:col-span-8 flex flex-col space-y-6">
                        <Card className="rounded-[2.5rem] border-border/60 bg-card overflow-hidden border shadow-sm">
                            <CardContent className="p-8 space-y-8 flex flex-col h-full text-foreground text-left">
                                <div className="space-y-2.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Internal Campaign Name</Label>
                                    <Input 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter a title for your reference..." 
                                        className="text-xl font-bold py-7 rounded-2xl border-0 bg-muted/20 focus-visible:ring-2 focus-visible:ring-primary/20 px-6 placeholder:text-muted-foreground/30"
                                    />
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border/50">
                                            {[
                                                { id: 'text', label: 'Basic Post', icon: Type },
                                                { id: 'image', label: 'Image Gallery', icon: ImageIcon },
                                                { id: 'video', label: 'Video Clip', icon: Video },
                                            ].map(type => (
                                                <button 
                                                    key={type.id}
                                                    onClick={() => setPostType(type.id)}
                                                    className={cn(
                                                        'flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all',
                                                        postType === type.id ? 'bg-background text-foreground border border-border shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                                    )}
                                                >
                                                    <type.icon className="w-3.5 h-3.5" /> {type.label}
                                                </button>
                                            ))}
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-[10px] text-primary font-black uppercase tracking-widest bg-primary/5 hover:bg-primary/10 rounded-full h-8 px-4 transition-all">
                                            ✨ AI Assistant
                                        </Button>
                                    </div>

                                    <div className="border border-border/60 rounded-[2rem] overflow-hidden bg-muted/10 focus-within:ring-2 focus-within:ring-primary/10 transition-all flex flex-col min-h-[300px] border">
                                        <div className="bg-card/40 border-b border-border/40 px-6 py-3 flex items-center gap-4 shrink-0 overflow-x-auto no-scrollbar">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-background rounded-lg"><span className="font-extrabold text-base">B</span></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-background rounded-lg"><span className="italic font-bold">I</span></Button>
                                            <div className="w-px h-5 bg-border/40" />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:bg-background rounded-lg"><PlusCircle className="w-4.5 h-4.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:bg-background rounded-lg"><Wand2 className="w-4.5 h-4.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:bg-background rounded-lg"><Hash className="w-4.5 h-4.5" /></Button>
                                        </div>
                                        <Textarea 
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Compose your message here..." 
                                            className="border-0 focus-visible:ring-0 rounded-none min-h-[220px] resize-none p-8 text-lg bg-transparent leading-relaxed placeholder:text-muted-foreground/20 italic font-medium"
                                        />
                                        {postType !== 'text' && (
                                            <div className="p-6 border-t border-border/20 bg-card/10 shrink-0">
                                                <div className="border-2 border-dashed border-border/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group shadow-inner">
                                                    <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                                                        <Plus className="w-8 h-8 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <span className="text-xs font-black uppercase tracking-widest text-foreground block">Upload {postType} Content</span>
                                                        <span className="text-[10px] font-medium text-muted-foreground">Max file size 50MB</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center px-2">
                                        <div className="flex gap-2">
                                            {selectedPlatforms.some(id => platforms.find(p => p.id === id)?.provider === 'twitter' && charCount > 280) && (
                                                <Badge variant="warning" className="rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-wider animate-pulse">
                                                    X Char Limit Exceeded
                                                </Badge>
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest transition-colors tabular-nums",
                                            charCount > 2000 ? 'text-rose-500' : 'text-muted-foreground opacity-40'
                                        )}>
                                            {charCount} / 2200 characters
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border/20">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Taxonomy & Tags</Label>
                                    <div className="flex flex-wrap gap-2.5 items-center px-1">
                                        {tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="rounded-full border border-border/60 bg-muted/40 px-4 py-2 gap-2.5 font-bold text-[10px] transition-all hover:bg-muted">
                                                #{tag} <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-500 transition-colors" onClick={() => removeTag(tag)} />
                                            </Badge>
                                        ))}
                                        <div className="flex items-center bg-muted/20 rounded-2xl px-4 border border-border/60 h-10 focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-inner">
                                            <Input 
                                                value={newTag} 
                                                onChange={(e) => setNewTag(e.target.value)} 
                                                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                                placeholder="New tag..." 
                                                className="w-24 border-0 bg-transparent text-xs focus-visible:ring-0 h-full font-bold p-0 shadow-none" 
                                            />
                                            <PlusCircle className="w-4 h-4 text-muted-foreground/30 ml-2" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Channel Selection Sidebar */}
                    <div className="lg:col-span-4 flex flex-col space-y-6">
                        <Card className="rounded-[2.5rem] border-border/60 bg-card overflow-hidden border shadow-sm flex-1">
                            <CardHeader className="p-8 pb-4 border-b border-border/20 bg-muted/10 flex flex-row items-center justify-between">
                                <div className="space-y-0.5 text-left">
                                    <CardTitle className="text-xl font-bold">Distribution</CardTitle>
                                    <CardDescription className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-40">Choose accounts</CardDescription>
                                </div>
                                <div className="flex flex-col items-end">
                                    <Badge variant="outline" className="rounded-full text-[10px] font-black uppercase bg-primary text-primary-foreground border-0 h-6 px-3 shadow-md">
                                        {selectedPlatforms.length} Active
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 space-y-1.5 overflow-y-auto max-h-[600px] no-scrollbar">
                                {platforms.length === 0 ? (
                                    <div className="p-6 flex flex-col items-center text-center gap-4">
                                        <div className="p-4 bg-muted rounded-full">
                                            <PlusCircle className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-foreground">No accounts connected</p>
                                            <p className="text-[11px] text-muted-foreground font-medium">Go to Settings → Connections to link your social media accounts before publishing.</p>
                                        </div>
                                        <Link to="/settings/connections" className="w-full">
                                            <Button variant="outline" className="w-full rounded-2xl h-11 font-bold text-xs gap-2">
                                                <PlusCircle className="w-4 h-4" /> Connect Accounts
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    platforms.map(platform => (
                                        <button
                                            key={platform.id}
                                            onClick={() => togglePlatform(platform.id)}
                                            className={cn(
                                                'flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-300 border border-transparent group',
                                                selectedPlatforms.includes(platform.id) ? cn(platform.bg, platform.border, 'shadow-md scale-[1.02]') : 'hover:bg-muted/40'
                                            )}
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={cn(
                                                    'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border border-border bg-card shrink-0 shadow-sm',
                                                    selectedPlatforms.includes(platform.id) ? cn('bg-card scale-110 shadow-lg', platform.color) : 'bg-card text-muted-foreground opacity-40'
                                                )}>
                                                    <platform.icon className="size-6" />
                                                </div>
                                                <div className="text-left min-w-0 font-sans">
                                                    <p className={cn("text-sm font-black leading-tight", selectedPlatforms.includes(platform.id) ? 'text-foreground' : 'text-muted-foreground opacity-60')}>
                                                        {platform.name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground font-medium truncate uppercase tracking-tighter mt-1 opacity-40 italic">
                                                        {platform.account}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedPlatforms.includes(platform.id) && (
                                                <div className={cn('rounded-full p-1.5 shadow-lg ring-4 ring-card shrink-0 animate-in zoom-in duration-300', platform.color.replace('text-', 'bg-').replace('600', '500').replace('700', '600'))}>
                                                    <Check className="w-3.5 h-3.5 text-white stroke-[4px]" />
                                                </div>
                                            )}
                                        </button>
                                    ))
                                )}
                                {platforms.length > 0 && (
                                    <div className="p-4 pt-6">
                                        <Link to="/settings/connections">
                                            <Button variant="outline" className="w-full border-dashed border-border/60 bg-muted/5 hover:bg-muted/10 rounded-2xl h-14 text-[10px] font-black uppercase tracking-[0.15em] gap-3 text-muted-foreground/60 transition-all hover:text-foreground">
                                                <PlusCircle className="w-5 h-5 opacity-40" />
                                                Add More Accounts
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Final Success Feedback */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6 animate-in fade-in duration-500">
                    <Card className="w-full max-w-sm rounded-[3rem] border border-white/5 bg-card/80 text-card-foreground animate-in zoom-in slide-in-from-bottom-10 duration-500 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border">
                        <CardContent className="p-12 text-center space-y-8">
                            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-500/20 animate-bounce">
                                <Check className="w-10 h-10 stroke-[3px]" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black tracking-tight text-foreground">Publication Engaged</h2>
                                <p className="text-muted-foreground text-sm font-medium leading-relaxed px-4">
                                    Your content was successfully published to{' '}
                                    <span className="text-foreground font-black uppercase">{selectedPlatforms.length}</span> account{selectedPlatforms.length !== 1 ? 's' : ''}.
                                </p>
                                {jobStatus?.result && (
                                    <p className="text-[11px] text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-xl break-all">
                                        Post ID: {jobStatus.result}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-3 pt-4">
                                <Link to="/posts" className="block">
                                    <Button className="w-full h-14 rounded-2xl font-extrabold transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/30 border-0 text-md">Return to Posts</Button>
                                </Link>
                                <Button variant="ghost" className="w-full h-12 rounded-2xl font-bold text-xs text-muted-foreground/40" onClick={() => setShowSuccessModal(false)}>Close</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
};

export default CreatePost;
