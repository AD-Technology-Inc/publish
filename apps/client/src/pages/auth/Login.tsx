import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input, Label, Checkbox } from '@/components/ui/core';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login
        setTimeout(() => {
            setIsLoading(false);
            navigate('/verify-email');
        }, 1000);
    };

    return (
        <AuthLayout 
            title="Welcome back" 
            description="Sign in to your dashboard to manage your event pipelines"
        >
            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Email Address</Label>
                            <div className="flex rounded-xl border border-border bg-muted/10 focus-within:ring-1 focus-within:ring-accent/20 focus-within:border-accent/40 overflow-hidden transition-all h-11 items-center">
                                <div className="pl-3.5 pr-2.5 text-muted-foreground/50 border-r border-border/40 h-full flex items-center bg-muted/5">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="name@example.com" 
                                    required 
                                    className="h-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none rounded-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="password" title="Password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Password</Label>
                                <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">Forgot password?</Link>
                            </div>
                            <div className="flex rounded-xl border border-border bg-muted/10 focus-within:ring-1 focus-within:ring-accent/20 focus-within:border-accent/40 overflow-hidden transition-all h-11 items-center">
                                <div className="pl-3.5 pr-2.5 text-muted-foreground/50 border-r border-border/40 h-full flex items-center bg-muted/5">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    required 
                                    className="h-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none rounded-none"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 px-1 py-1">
                            <Checkbox id="remember" className="rounded-md border-border/80 data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
                            <Label htmlFor="remember" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">Remember me for 30 days</Label>
                        </div>
                    </div>
                    <Button 
                        type="submit" 
                        variant="accent"
                        className="w-full h-12 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/15 border-0 mt-2 flex items-center justify-center gap-2 group/btn"
                        disabled={isLoading}
                    >
                        <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                        {!isLoading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                    </Button>
                </form>
 
                <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/40" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-zinc-950 px-4 text-[10px] font-black text-muted-foreground/40 tracking-widest">Or continue with</span>
                    </div>
                </div>
 
                <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-border bg-zinc-950/60 shadow-xs hover:bg-white/5 hover:border-zinc-700 hover:text-foreground transition-all flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.626 5.626 0 0 1 8.35 12.98a5.626 5.626 0 0 1 5.64-5.62c1.558 0 2.973.57 4.073 1.507l3.167-3.166C19.294 3.86 16.85 2.76 13.99 2.76A10.22 10.22 0 0 0 3.75 13a10.22 10.22 0 0 0 10.24 10.24c5.78 0 10.25-4.06 10.25-10.24 0-.69-.06-1.35-.18-1.996H12.24Z"/>
                    </svg>
                    <span>Google</span>
                </Button>
 
                <p className="text-center text-xs text-muted-foreground font-medium mt-2">
                    New to AD. Publish?{' '}
                    <Link to="/register" className="font-black text-accent hover:underline">
                        Create an account
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Login;
