import * as React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input, Label } from '@/components/ui/core';
import { Mail, ArrowRight, ArrowLeft, LoaderCircle, MailCheck } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSent, setIsSent] = React.useState(false);
    const [email, setEmail] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 1200);
    };

    return (
        <AuthLayout
            title={isSent ? 'Check your inbox' : 'Reset your password'}
            description={
                isSent
                    ? `We sent a reset link to ${email || 'your email address'}.`
                    : "Enter your email and we'll send you a link to reset your password."
            }
        >
            <div className="space-y-6">
                {isSent ? (
                    /* ── Success state ── */
                    <div className="space-y-5">
                        {/* Icon pill */}
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                <MailCheck className="w-7 h-7 text-accent" />
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center space-y-1">
                            <p className="text-xs font-semibold text-zinc-300 leading-relaxed">
                                Recovery email dispatched. Follow the link inside to reset your
                                security credentials.
                            </p>
                            <p className="text-[10px] text-zinc-600 font-medium">
                                Didn't receive it? Check your spam folder.
                            </p>
                        </div>

                        <Button
                            onClick={() => {
                                setIsSent(false);
                                setEmail('');
                            }}
                            variant="outline"
                            className="w-full h-11 rounded-xl border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 text-sm font-semibold text-zinc-300 hover:text-white transition-all"
                        >
                            Send to a different email
                        </Button>
                    </div>
                ) : (
                    /* ── Form ── */
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="email"
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-0.5"
                            >
                                Email address
                            </Label>
                            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/70 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 transition-all overflow-hidden h-11">
                                <div className="pl-3.5 pr-3 flex items-center self-stretch border-r border-zinc-800/80 bg-zinc-900/50 shrink-0">
                                    <Mail className="w-4 h-4 text-zinc-500" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-full flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none rounded-none text-sm text-white placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="accent"
                            disabled={isLoading}
                            className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/10 border-0 flex items-center justify-center gap-2 group/btn transition-all hover:shadow-accent/20"
                        >
                            {isLoading ? (
                                <>
                                    <LoaderCircle className="w-4 h-4 animate-spin" />
                                    <span>Sending…</span>
                                </>
                            ) : (
                                <>
                                    <span>Send reset link</span>
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                )}

                <p className="text-center text-xs text-zinc-600 font-medium">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 font-black text-accent hover:text-accent/80 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
