import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, LoaderCircle, ShieldCheck } from 'lucide-react';

/* ─── Password strength ──────────────────────────────────────── */
type StrengthLevel = 0 | 1 | 2 | 3 | 4;

function getStrength(pwd: string): StrengthLevel {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 14) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(4, score) as StrengthLevel;
}

const STRENGTH_META: Record<StrengthLevel, { label: string; color: string; bars: number }> = {
    0: { label: '', color: 'bg-zinc-800', bars: 0 },
    1: { label: 'Weak', color: 'bg-red-500', bars: 1 },
    2: { label: 'Fair', color: 'bg-orange-400', bars: 2 },
    3: { label: 'Good', color: 'bg-yellow-400', bars: 3 },
    4: { label: 'Strong', color: 'bg-emerald-400', bars: 4 },
};

/* ─── Auth field ─────────────────────────────────────────────── */
const AuthField = ({
    id,
    label,
    icon: Icon,
    children,
}: {
    id: string;
    label: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <Label
            htmlFor={id}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-0.5"
        >
            {label}
        </Label>
        <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/70 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all overflow-hidden h-11">
            <div className="pl-3.5 pr-3 flex items-center self-stretch border-r border-zinc-800/80 bg-zinc-900/50 shrink-0">
                <Icon className="w-4 h-4 text-zinc-500" />
            </div>
            {children}
        </div>
    </div>
);

/* ─── Reset Password page ────────────────────────────────────── */
export const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [showNew, setShowNew] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [password, setPassword] = React.useState('');
    const [confirm, setConfirm] = React.useState('');

    const strength = getStrength(password);
    const meta = STRENGTH_META[strength];
    const mismatch = confirm.length > 0 && confirm !== password;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) return;
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 1800);
        }, 1200);
    };

    return (
        <AuthLayout
            title="Choose a new password"
            description="Create a strong, unique password for your account."
        >
            <div className="space-y-6">
                {isSuccess ? (
                    /* ── Success ── */
                    <div className="space-y-5 text-center">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <ShieldCheck className="w-7 h-7 text-emerald-400" />
                            </div>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
                            <p className="text-xs font-semibold text-zinc-300 leading-relaxed">
                                Your password has been updated successfully.
                            </p>
                            <p className="text-[10px] text-zinc-600 font-medium">
                                Redirecting you to sign in…
                            </p>
                        </div>
                    </div>
                ) : (
                    /* ── Form ── */
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <AuthField id="password" label="New password" icon={Lock}>
                                <Input
                                    id="password"
                                    type={showNew ? 'text' : 'password'}
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-full flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none rounded-none text-sm text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew((p) => !p)}
                                    className="pr-3.5 pl-2 flex items-center self-stretch text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
                                    aria-label={showNew ? 'Hide password' : 'Show password'}
                                >
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </AuthField>

                            {/* Strength bar */}
                            {password.length > 0 && (
                                <div className="space-y-1.5 px-0.5">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                    i <= meta.bars ? meta.color : 'bg-zinc-800'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    {meta.label && (
                                        <p className="text-[10px] font-semibold text-zinc-500">
                                            Strength:{' '}
                                            <span
                                                className={
                                                    strength <= 1
                                                        ? 'text-red-400'
                                                        : strength === 2
                                                        ? 'text-orange-400'
                                                        : strength === 3
                                                        ? 'text-yellow-400'
                                                        : 'text-emerald-400'
                                                }
                                            >
                                                {meta.label}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <AuthField id="confirmPassword" label="Confirm new password" icon={Lock}>
                                <Input
                                    id="confirmPassword"
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    autoComplete="new-password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="h-full flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none rounded-none text-sm text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((p) => !p)}
                                    className="pr-3.5 pl-2 flex items-center self-stretch text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
                                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirm ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </AuthField>
                            {mismatch && (
                                <p className="text-[11px] text-red-400 font-medium px-0.5">
                                    Passwords do not match.
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || mismatch || !password}
                            className="w-full h-11 mt-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10 border-0 flex items-center justify-center gap-2 group/btn transition-all hover:shadow-primary/20"
                        >
                            {isLoading ? (
                                <>
                                    <LoaderCircle className="w-4 h-4 animate-spin" />
                                    <span>Resetting…</span>
                                </>
                            ) : (
                                <>
                                    <span>Reset password</span>
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                )}

                {!isSuccess && (
                    <p className="text-center text-xs text-zinc-600 font-medium">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 font-black text-primary hover:text-primary/80 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Cancel and sign in
                        </Link>
                    </p>
                )}
            </div>
        </AuthLayout>
    );
};

export default ResetPassword;
