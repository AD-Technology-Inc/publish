import * as React from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import { Heading } from '@/components/Heading';
import {
    Button,
    Card,
    CardContent,
    Badge,
    Input,
    Label,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/core';
import {
    Plus,
    CheckCircle2,
    Trash2,
    Info,
    AlertCircle,
    XCircle,
    Loader2,
} from 'lucide-react';
import { Facebook, Instagram, Linkedin, Twitter } from '@/components/SocialIcons';
import { cn } from '@/lib/utils';
import { useTitle } from '@/hooks/use-title';
import { accountsApi } from '@/api/client';
import type { Account, ConnectAccountRequest } from '@/api/types';

const PROVIDERS = [
    { id: 'facebook' as const,  name: 'Facebook',     icon: Facebook,  color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { id: 'instagram' as const, name: 'Instagram',    icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/30' },
    { id: 'linkedin' as const,  name: 'LinkedIn',     icon: Linkedin,  color: 'text-blue-700', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { id: 'twitter' as const,   name: 'Twitter / X',  icon: Twitter,   color: 'text-sky-500',  bg: 'bg-sky-50 dark:bg-sky-950/30' },
] as const;

type ProviderId = typeof PROVIDERS[number]['id'];

const getStatusBadge = (status: Account['status']) => {
    switch (status) {
        case 'connected':  return { variant: 'success'     as const, icon: CheckCircle2, text: 'Connected' };
        case 'processing': return { variant: 'secondary'   as const, icon: Loader2,      text: 'Processing' };
        case 'expired':    return { variant: 'warning'     as const, icon: AlertCircle,  text: 'Expired' };
        default:           return { variant: 'destructive' as const, icon: XCircle,      text: 'Disconnected' };
    }
};

export const Connections: React.FC = () => {
    useTitle('Social Connections');

    const [accounts, setAccounts] = React.useState<Account[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedProvider, setSelectedProvider] = React.useState<typeof PROVIDERS[number] | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [connecting, setConnecting] = React.useState(false);
    const [connectError, setConnectError] = React.useState('');

    // Form fields
    const [formName, setFormName] = React.useState('');
    const [formPageId, setFormPageId] = React.useState('');
    const [formToken, setFormToken] = React.useState('');

    const breadcrumbs = [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Connections', href: '/settings/connections' },
    ];

    const fetchAccounts = React.useCallback(async () => {
        try {
            const data = await accountsApi.list();
            setAccounts(data);
        } catch {
            // Gateway unavailable in dev — keep empty
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

    const openConnectDialog = (provider: typeof PROVIDERS[number]) => {
        setSelectedProvider(provider);
        setFormName('');
        setFormPageId('');
        setFormToken('');
        setConnectError('');
        setIsDialogOpen(true);
    };

    const handleConnect = async () => {
        if (!selectedProvider || !formName || !formPageId || !formToken) {
            setConnectError('All fields are required.');
            return;
        }
        setConnecting(true);
        setConnectError('');
        const req: ConnectAccountRequest = {
            provider: selectedProvider.id,
            name: formName,
            page_id: formPageId,
            access_token: formToken,
        };
        try {
            const created = await accountsApi.connect(req);
            setAccounts(prev => [...prev, created]);
            setIsDialogOpen(false);
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            setConnectError(err.response?.data?.detail ?? 'Connection failed. Please try again.');
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async (accountId: string) => {
        try {
            await accountsApi.disconnect(accountId);
            setAccounts(prev => prev.filter(a => a.id !== accountId));
        } catch {
            /* ignore */
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <div className="space-y-10 text-left">
                    <Heading
                        title="Social Connections"
                        description="Link your social media accounts to start publishing content."
                    />

                    {/* Add Connection Grid */}
                    <section className="space-y-4">
                        <h3 className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground uppercase opacity-60 px-1">
                            <Plus className="h-3 w-3" />
                            Connect New Platform
                        </h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {PROVIDERS.map((provider) => (
                                <button
                                    key={provider.id}
                                    onClick={() => openConnectDialog(provider)}
                                    className="group flex flex-col items-center justify-center rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/[0.02]"
                                >
                                    <div className={cn('mb-4 rounded-2xl p-4 transition-transform group-hover:scale-110 duration-500 shadow-sm', provider.bg)}>
                                        <provider.icon className={cn('h-7 w-7', provider.color)} />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight">{provider.name}</span>
                                    <span className="mt-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Ready to link</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Connect Dialog */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-8">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                                    {selectedProvider && (
                                        <div className={cn('p-2.5 rounded-xl', selectedProvider.bg)}>
                                            <selectedProvider.icon className={cn('h-5 w-5', selectedProvider.color)} />
                                        </div>
                                    )}
                                    Connect {selectedProvider?.name}
                                </DialogTitle>
                                <DialogDescription className="pt-2 text-sm font-medium">
                                    Enter your page details and access token to establish a secure connection.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="page_name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Page / Account Name</Label>
                                    <Input
                                        id="page_name"
                                        placeholder="e.g. My Brand Page"
                                        value={formName}
                                        onChange={e => setFormName(e.target.value)}
                                        className="h-11 rounded-2xl bg-muted/50 border-border px-4"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="page_id" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                                        {selectedProvider?.id === 'facebook' ? 'Facebook Page ID' : 'Profile / Page ID'}
                                    </Label>
                                    <Input
                                        id="page_id"
                                        placeholder="e.g. 123456789012345"
                                        value={formPageId}
                                        onChange={e => setFormPageId(e.target.value)}
                                        className="h-11 rounded-2xl bg-muted/50 border-border px-4"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="access_token" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Page Access Token</Label>
                                    <Input
                                        id="access_token"
                                        type="password"
                                        placeholder="Paste your token here..."
                                        value={formToken}
                                        onChange={e => setFormToken(e.target.value)}
                                        className="h-11 rounded-2xl bg-muted/50 border-border px-4"
                                    />
                                </div>
                                {connectError && (
                                    <p className="text-xs font-bold text-rose-500 px-1">{connectError}</p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
                                    onClick={handleConnect}
                                    disabled={connecting}
                                >
                                    {connecting ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting…</>
                                    ) : 'Authorize Connection'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Active Connections */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground uppercase opacity-60">
                                <CheckCircle2 className="h-3 w-3" />
                                Your Connected Accounts
                            </h3>
                            <Badge variant="outline" className="font-bold text-[10px] rounded-full px-3">{accounts.length} Accounts</Badge>
                        </div>

                        <div className="grid gap-3">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : accounts.length > 0 ? (
                                accounts.map((account) => {
                                    const provider = PROVIDERS.find(p => p.id === (account.provider as ProviderId));
                                    const status = getStatusBadge(account.status);
                                    if (!provider) return null;
                                    return (
                                        <Card key={account.id} className="overflow-hidden border-border/50 bg-card shadow-sm hover:border-primary/10 transition-all rounded-[2rem]">
                                            <CardContent className="p-5">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex min-w-0 items-center gap-4">
                                                        <div className={cn('flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-inner', provider.bg)}>
                                                            <provider.icon className={cn('h-5 w-5', provider.color)} />
                                                        </div>
                                                        <div className="flex min-w-0 flex-col">
                                                            <div className="flex items-center gap-3">
                                                                <span className="truncate text-base font-bold tracking-tight text-foreground">{account.name}</span>
                                                                <Badge variant={status.variant} className="h-5 px-2 text-[9px] font-black uppercase tracking-wider rounded-full">
                                                                    {status.text}
                                                                </Badge>
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mt-0.5">
                                                                ID: {account.page_id} · Linked {account.connected_at}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500"
                                                        title="Disconnect"
                                                        onClick={() => handleDisconnect(account.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-border/60 bg-muted/20 p-16 text-center">
                                    <div className="mb-6 rounded-full bg-muted/50 p-6 shadow-inner">
                                        <Info className="h-10 w-10 text-muted-foreground/20" />
                                    </div>
                                    <h4 className="text-lg font-bold text-foreground">No Accounts Connected</h4>
                                    <p className="mt-2 max-w-xs text-sm font-medium text-muted-foreground leading-relaxed">
                                        Connect your first social media account above to start publishing content.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
};

export default Connections;
