import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input, Label } from '@/components/ui/core';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate registration
        setTimeout(() => {
            setIsLoading(false);
            navigate('/verify-email');
        }, 1200);
    };

    return (
        <AuthLayout 
            title="Create your account" 
            description="Get started with next-gen distributed coordination today"
        >
            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-600 text-left">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Full Name</Label>
                            <div className="flex rounded-xl border border-border bg-muted/10 focus-within:ring-1 focus-within:ring-accent/20 focus-within:border-accent/40 overflow-hidden transition-all h-11 items-center">
                                <div className="pl-3.5 pr-2.5 text-muted-foreground/50 border-r border-border/40 h-full flex items-center bg-muted/5">
                                    <User className="w-4 h-4" />
                                </div>
                                <Input 
                                    id="name" 
                                    type="text" 
                                    placeholder="John Doe" 
                                    required 
                                    className="h-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none rounded-none"
                                />
                            </div>
                        </div>
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
                            <Label htmlFor="password" title="Password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Password</Label>
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
                    </div>
                    <Button 
                        type="submit" 
                        variant="accent"
                        className="w-full h-12 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/15 border-0 mt-4 flex items-center justify-center gap-2 group/btn"
                        disabled={isLoading}
                    >
                        <span>{isLoading ? 'Creating Account...' : 'Continue'}</span>
                        {!isLoading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                    </Button>
                </form>
 
                <p className="px-8 text-center text-xs text-muted-foreground font-medium leading-relaxed mt-2">
                    By clicking continue, you agree to our{' '}
                    <Link to="#" className="font-black text-accent hover:underline">Terms of Service</Link>{' '}
                    and{' '}
                    <Link to="#" className="font-black text-accent hover:underline">Privacy Policy</Link>.
                </p>
 
                <p className="text-center text-xs text-muted-foreground font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="font-black text-accent hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Register;
