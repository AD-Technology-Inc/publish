import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input, Label } from '@/components/ui/core';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [code, setCode] = React.useState<string[]>(Array(6).fill(''));

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const newCode = [...code];
        newCode[index] = element.value;
        setCode(newCode);

        // Move to next field if current field has a value
        if (element.value && element.nextSibling) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && e.currentTarget.previousSibling) {
            (e.currentTarget.previousSibling as HTMLInputElement).focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate email verification
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        }, 1200);
    };

    return (
        <AuthLayout 
            title="Verify your email" 
            description="We sent a 6-digit verification code to your email address"
        >
            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
                {isSuccess ? (
                    <div className="space-y-4 text-center">
                        <div className="p-4 bg-green-500/5 border border-green-500/20 text-green-400 rounded-xl text-xs font-semibold leading-relaxed">
                            Email verified successfully. Welcome to the platform! Redirecting to dashboard...
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 text-center">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Verification Code</Label>
                            <div className="flex justify-between gap-2 pt-2">
                                {code.map((data, index) => (
                                    <Input
                                        key={index}
                                        type="text"
                                        maxLength={1}
                                        value={data}
                                        onChange={e => handleChange(e.target, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        className="w-11 h-12 text-center text-lg font-bold rounded-xl border-border bg-muted/10 focus-visible:ring-accent/20 focus-visible:border-accent/40"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Button 
                                type="submit" 
                                variant="accent"
                                className="w-full h-12 rounded-xl font-bold shadow-lg shadow-accent/15 transition-all hover:scale-[1.02] active:scale-95 border-0 flex items-center justify-center gap-2 group/btn"
                                disabled={isLoading || code.some(val => val === '')}
                            >
                                <span>{isLoading ? 'Verifying...' : 'Verify Code'}</span>
                                {!isLoading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                            </Button>
                            <Button 
                                type="button"
                                variant="outline"
                                className="w-full h-11 rounded-xl font-bold border-border bg-zinc-950/60 shadow-xs hover:bg-white/5 hover:border-zinc-700 hover:text-foreground transition-all"
                            >
                                Resend Code
                            </Button>
                        </div>
                    </form>
                )}

                <p className="text-center text-xs text-muted-foreground font-medium mt-2">
                    <Link to="/register" className="inline-flex items-center gap-1.5 font-black text-accent hover:underline">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Create another account</span>
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default VerifyEmail;
