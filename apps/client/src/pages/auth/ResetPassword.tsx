import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input, Label } from '@/components/ui/core';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';

export const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate password reset
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        }, 1200);
    };

    return (
        <AuthLayout 
            title="Choose new password" 
            description="Create a strong, unique password for your account"
        >
            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
                {isSuccess ? (
                    <div className="space-y-4 text-center">
                        <div className="p-4 bg-green-500/5 border border-green-500/20 text-green-400 rounded-xl text-xs font-semibold leading-relaxed">
                            Your password has been successfully updated. Redirecting to login...
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">New Password</Label>
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
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Confirm New Password</Label>
                                <div className="flex rounded-xl border border-border bg-muted/10 focus-within:ring-1 focus-within:ring-accent/20 focus-within:border-accent/40 overflow-hidden transition-all h-11 items-center">
                                    <div className="pl-3.5 pr-2.5 text-muted-foreground/50 border-r border-border/40 h-full flex items-center bg-muted/5">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <Input 
                                        id="confirmPassword" 
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
                            className="w-full h-12 rounded-xl font-bold shadow-lg shadow-accent/15 transition-all hover:scale-[1.02] active:scale-95 border-0 mt-2 flex items-center justify-center gap-2 group/btn"
                            disabled={isLoading}
                        >
                            <span>{isLoading ? 'Resetting Password...' : 'Reset Password'}</span>
                            {!isLoading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                        </Button>
                    </form>
                )}

                <p className="text-center text-xs text-muted-foreground font-medium mt-2">
                    <Link to="/login" className="inline-flex items-center gap-1.5 font-black text-accent hover:underline">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Cancel and sign in</span>
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default ResetPassword;
