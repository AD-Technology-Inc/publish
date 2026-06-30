import * as React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input, Label } from '@/components/ui/core';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSent, setIsSent] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate sending reset link
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 1200);
    };

    return (
        <AuthLayout 
            title={isSent ? "Check your inbox" : "Reset your password"} 
            description={isSent ? "We sent a password reset link to your email address" : "Enter your email and we'll send you a link to reset your password"}
        >
            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
                {isSent ? (
                    <div className="space-y-4 text-center">
                        <div className="p-4 bg-accent/5 border border-accent/20 text-accent rounded-xl text-xs font-semibold leading-relaxed">
                            A recovery email has been dispatched. Please follow the instructions to reset your security credentials.
                        </div>
                        <Button 
                            onClick={() => setIsSent(false)}
                            variant="outline"
                            className="w-full h-12 rounded-xl font-bold border-border bg-zinc-950/60 transition-all"
                        >
                            Resend email
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                        <Button 
                            type="submit" 
                            variant="accent"
                            className="w-full h-12 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/15 border-0 mt-2 flex items-center justify-center gap-2 group/btn"
                            disabled={isLoading}
                        >
                            <span>{isLoading ? 'Sending Link...' : 'Send Reset Link'}</span>
                            {!isLoading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                        </Button>
                    </form>
                )}

                <p className="text-center text-xs text-muted-foreground font-medium mt-2">
                    <Link to="/login" className="inline-flex items-center gap-1.5 font-black text-accent hover:underline">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to sign in</span>
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
