import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button, Input, Label, Checkbox } from "@/components/ui/core";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    LoaderCircle,
} from "lucide-react";

/* ─── Reusable icon-prefixed field wrapper ───────────────────── */
const AuthField = ({
    id,
    label,
    icon: Icon,
    suffix,
    children,
}: {
    id: string;
    label: React.ReactNode;
    icon: React.ElementType;
    suffix?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between">
            <Label
                htmlFor={id}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-0.5"
            >
                {label}
            </Label>
            {suffix}
        </div>
        <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/70 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all overflow-hidden h-11">
            <div className="pl-3.5 pr-3 flex items-center self-stretch border-r border-zinc-800/80 bg-zinc-900/50 shrink-0">
                <Icon className="w-4 h-4 text-zinc-500" />
            </div>
            {children}
        </div>
    </div>
);

/* ─── Login page ─────────────────────────────────────────────── */
export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate("/verify-email");
        }, 1000);
    };

    return (
        <AuthLayout
            title="Welcome back"
            description="Sign in to your dashboard to manage your event pipelines."
        >
            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <AuthField
                        id="password"
                        label="Password"
                        icon={Lock}
                        suffix={
                            <Link
                                to="/forgot-password"
                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        }
                    >
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            className="h-full flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 shadow-none rounded-none text-sm text-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="pr-3.5 pl-2 flex items-center self-stretch text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </AuthField>

                    <div className="flex items-center gap-2.5 px-0.5 pt-1">
                        <Checkbox
                            id="remember"
                            className="rounded-md border-zinc-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                            htmlFor="remember"
                            className="text-xs font-medium text-zinc-500 cursor-pointer select-none"
                        >
                            Remember me for 30 days
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 mt-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10 border-0 flex items-center justify-center gap-2 group/btn transition-all hover:shadow-primary/20"
                    >
                        {isLoading ? (
                            <>
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                                <span>Signing in…</span>
                            </>
                        ) : (
                            <>
                                <span>Sign in</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-zinc-950 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Google OAuth */}
                <button
                    type="button"
                    className="w-full h-11 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 text-sm font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2.5"
                >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    <span>Continue with Google</span>
                </button>

                <p className="text-center text-xs text-zinc-600 font-medium">
                    New to AD. Publish?{" "}
                    <Link
                        to="/register"
                        className="font-black text-primary hover:text-primary/80 transition-colors"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Login;
