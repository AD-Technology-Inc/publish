import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input, Label } from '@/components/ui/core';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, LoaderCircle } from 'lucide-react';

/* ─── Password strength helper ───────────────────────────────── */
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

const STRENGTH_META: Record<
    StrengthLevel,
    { label: string; color: string; bars: number }
> = {
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
        <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/70 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 transition-all overflow-hidden h-11">
            <div className="pl-3.5 pr-3 flex items-center self-stretch border-r border-zinc-800/80 bg-zinc-900/50 shrink-0">
                <Icon className="w-4 h-4 text-zinc-500" />
            </div>
            {children}
        </div>
    </div>
);

/* ─── Register page ──────────────────────────────────────────── */
export const Register: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [password, setPassword] = React.useState('');

    const strength = getStrength(password);
    const meta = STRENGTH_META[strength];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate('/verify-email');
        }, 1200);
    };

    return (
        <AuthLayout
            title="Create your account"
            description="Get started with next-gen distributed coordination today."
        >
            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <AuthField id="name" label="Full name" icon={User}>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Jane Doe"
                            required
                            autoComplete="name"
                            className="h-full flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none rounded-none text-sm text-white placeholder:text-zinc-600"
                        />
                    </AuthField>

                    <AuthField id="email" label="Email address" icon={Mail}>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            autoComplete="email"
                            className="h-full flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none rounded-none text-sm text-white placeholder:text-zinc-600"
                        />
                    </AuthField>

                    <div className="space-y-2">
                        <AuthField id="password" label="Password" icon={Lock}>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-full flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none rounded-none text-sm text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                className="pr-3.5 pl-2 flex items-center self-stretch text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
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
                                        Password strength:{' '}
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

                    <Button
                        type="submit"
                        variant="accent"
                        disabled={isLoading}
                        className="w-full h-11 mt-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/10 border-0 flex items-center justify-center gap-2 group/btn transition-all hover:shadow-accent/20"
                    >
                        {isLoading ? (
                            <>
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                                <span>Creating account…</span>
                            </>
                        ) : (
                            <>
                                <span>Create account</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </Button>
                </form>

                <p className="text-center text-[11px] text-zinc-600 font-medium leading-relaxed">
                    By creating an account you agree to our{' '}
                    <Link to="#" className="font-black text-accent hover:text-accent/80 transition-colors">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="#" className="font-black text-accent hover:text-accent/80 transition-colors">
                        Privacy Policy
                    </Link>
                    .
                </p>

                <p className="text-center text-xs text-zinc-600 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="font-black text-accent hover:text-accent/80 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Register;
