import * as React from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockUser } from '@/mocks';
import { useTitle } from '@/hooks/use-title';
import { Camera, Check, User as UserIcon } from 'lucide-react';

export const Profile: React.FC = () => {
    useTitle('Profile Settings');
    const user = mockUser;

    const [formData, setFormData] = React.useState({
        name: user.name,
        email: user.email,
    });

    const breadcrumbs = [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Profile', href: '/settings/profile' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <div className="space-y-8 animate-in fade-in duration-500 text-left">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-foreground">Profile</h2>
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.1em] opacity-60">Manage your public presence and private data.</p>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="grid grid-cols-1 gap-12">
                        {/* Avatar Section */}
                        <div className="space-y-6">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Profile Picture</Label>
                            <div className="flex items-center gap-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-[2rem] bg-muted border border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/20 shadow-sm">
                                        <UserIcon className="w-10 h-10 text-muted-foreground/40 group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <button className="absolute -bottom-1 -right-1 w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg hover:scale-110 hover:bg-primary-hover transition-all active:scale-95 border-4 border-background">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-foreground">Change avatar</p>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed max-w-[200px]">JPG, GIF or PNG. <br />Max size of 2MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Info Card */}
                        <Card className="rounded-[2.5rem] border-border/80 bg-card shadow-lg shadow-black/[0.02]">
                            <CardHeader className="p-8 pb-3">
                                <CardTitle className="text-base font-bold">Personal Information</CardTitle>
                                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">These details will be used for your account presence.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Full Name</Label>
                                        <Input 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="h-11 rounded-xl border-border bg-muted/20 focus-visible:ring-primary/20 font-medium px-4" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Email Address</Label>
                                        <Input 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="h-11 rounded-xl border-border bg-muted/20 focus-visible:ring-primary/20 font-medium px-4" 
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-border/40 flex justify-end">
                                    <Button className="rounded-xl h-11 px-8 font-bold gap-2 shadow-lg shadow-primary/15">
                                        <Check className="w-4 h-4" /> Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dangerous Zone */}
                        <div className="pt-12">
                             <div className="p-8 rounded-[2rem] border border-rose-500/10 bg-rose-500/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-rose-600">Delete Account</h4>
                                    <p className="text-xs text-muted-foreground font-medium">Permanently remove your account and all associated data.</p>
                                </div>
                                <Button variant="danger" className="rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest">
                                    Deactivate
                                </Button>
                             </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
};

export default Profile;
