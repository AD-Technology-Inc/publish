import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/core';
import { ArrowRight, ArrowLeft, LoaderCircle, PartyPopper, RotateCcw } from 'lucide-react';

const OTP_LENGTH = 6;

export const VerifyEmail: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [code, setCode] = React.useState<string[]>(Array(OTP_LENGTH).fill(''));
    const inputRefs = React.useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null));

    const isComplete = code.every((v) => v !== '');

    /* Focus first input on mount */
    React.useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;
        const digit = value.slice(-1); // only last char
        const newCode = [...code];
        newCode[index] = digit;
        setCode(newCode);
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (code[index]) {
                const newCode = [...code];
                newCode[index] = '';
                setCode(newCode);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    /* Paste support */
    const handlePaste = (e: React.ClipboardEvent, index: number) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        const newCode = [...code];
        pasted.split('').forEach((char, i) => {
            if (index + i < OTP_LENGTH) newCode[index + i] = char;
        });
        setCode(newCode);
        const nextFocus = Math.min(index + pasted.length, OTP_LENGTH - 1);
        inputRefs.current[nextFocus]?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isComplete) return;
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => navigate('/dashboard'), 1800);
        }, 1200);
    };

    return (
        <AuthLayout
            title="Verify your email"
            description="Enter the 6-digit code we sent to your email address."
        >
            <div className="space-y-6">
                {isSuccess ? (
                    /* ── Success ── */
                    <div className="space-y-5 text-center">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <PartyPopper className="w-7 h-7 text-emerald-400" />
                            </div>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
                            <p className="text-xs font-semibold text-zinc-300 leading-relaxed">
                                Email verified successfully — welcome to AD. Publish!
                            </p>
                            <p className="text-[10px] text-zinc-600 font-medium">
                                Redirecting to your dashboard…
                            </p>
                        </div>
                    </div>
                ) : (
                    /* ── Form ── */
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP inputs */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-0.5">
                                Verification code
                            </p>
                            <div className="flex items-center justify-between gap-2">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(e.target.value, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onPaste={(e) => handlePaste(e, index)}
                                        aria-label={`Digit ${index + 1}`}
                                        className={[
                                            'w-full aspect-square max-w-[52px] text-center text-lg font-black rounded-xl border bg-zinc-900/70 text-white',
                                            'transition-all duration-200 outline-none',
                                            'focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-zinc-800/80',
                                            digit
                                                ? 'border-primary/40 bg-zinc-800/60'
                                                : 'border-zinc-800',
                                        ].join(' ')}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                type="submit"
                                disabled={isLoading || !isComplete}
                                className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10 border-0 flex items-center justify-center gap-2 group/btn transition-all hover:shadow-primary/20"
                            >
                                {isLoading ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 animate-spin" />
                                        <span>Verifying…</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Verify code</span>
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setCode(Array(OTP_LENGTH).fill(''))}
                                className="w-full h-11 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Resend code
                            </button>
                        </div>
                    </form>
                )}

                <p className="text-center text-xs text-zinc-600 font-medium">
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-1.5 font-black text-primary hover:text-primary/80 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Create another account
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default VerifyEmail;
