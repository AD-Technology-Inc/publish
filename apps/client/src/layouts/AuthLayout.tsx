import * as React from "react";
import { AppLogo } from "@/components/AppLogo";

interface Props {
    title?: string;
    description?: string;
    children: React.ReactNode;
}

const STATS = [
    { value: "99.98%", label: "Uptime SLA" },
    { value: "<2ms", label: "P99 Latency" },
    { value: "10M+", label: "Events / day" },
];



export const AuthLayout: React.FC<Props> = ({ title, description, children }) => {
    return (
        <div className="flex min-h-screen bg-zinc-950 font-sans overflow-hidden">
            {/* ── Left panel ─────────────────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[46%] xl:w-[50%] relative flex-col justify-between p-10 xl:p-14 border-r border-white/[0.06] overflow-hidden">
                {/* Background layers */}
                <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                {/* Fine grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:52px_52px] pointer-events-none" />
                {/* Radial primary glow */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_20%_-10%,var(--primary),transparent_55%)] opacity-[0.12] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-[radial-gradient(ellipse_at_80%_100%,var(--primary),transparent_60%)] opacity-[0.06] pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 flex items-center gap-3">
                    <AppLogo />
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-400/20 rounded-full px-2.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        All systems operational
                    </span>
                </div>

                {/* Middle content */}
                <div className="relative z-10 space-y-10 my-auto max-w-[480px]">
                    {/* Tag */}
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-primary">
                        Reliability Engine
                    </span>

                    {/* Headline */}
                    <div className="space-y-4">
                        <h2 className="text-3xl xl:text-[2.6rem] font-extrabold text-white tracking-tight leading-[1.1]">
                            Distributed coordination{" "}
                            <span className="text-primary">without the chaos.</span>
                        </h2>
                        <p className="text-sm text-zinc-400 leading-relaxed font-medium max-w-sm">
                            High-frequency pipelines, decoupled ingestion routes, and
                            zero-downtime deploys — built on FastAPI, Redis Streams, and
                            PostgreSQL.
                        </p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4">
                        {STATS.map((s) => (
                            <div
                                key={s.label}
                                className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 text-left backdrop-blur-sm"
                            >
                                <p className="text-xl xl:text-2xl font-black text-white tabular-nums">
                                    {s.value}
                                </p>
                                <p className="text-[10px] font-mono text-zinc-500 mt-0.5 uppercase tracking-wider">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Terminal log block */}
                    <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 backdrop-blur-md p-5 font-mono text-[11px] space-y-2.5 shadow-2xl">
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                                <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
                                <span className="w-2 h-2 rounded-full bg-green-500/70" />
                            </div>
                            <span className="text-zinc-600 text-[9px]">cluster-logs</span>
                        </div>
                        <div className="space-y-1.5 text-zinc-400 leading-relaxed">
                            <p className="flex items-center gap-2">
                                <span className="text-primary shrink-0">●</span>
                                <span>[ingress-gateway] edge routing initialized</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-blue-400 shrink-0">●</span>
                                <span>[redis-streams] consumer buffer established (0.02ms)</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-purple-400 shrink-0">●</span>
                                <span>[publish-service] worker group registered (n=8)</span>
                            </p>
                            <p className="flex items-center gap-2 text-green-400">
                                <span className="shrink-0">$</span>
                                <span className="animate-pulse">awaiting telemetry events...</span>
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="relative z-10 text-[10px] font-mono text-zinc-600">
                    © 2026 AD. Publish · All rights reserved
                </div>
            </div>

            {/* ── Right panel ─────────────────────────────────────────── */}
            <div className="w-full lg:w-[54%] xl:w-[50%] flex flex-col justify-center items-center px-6 py-12 md:px-16 relative bg-zinc-950">
                {/* Subtle ambient glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,var(--primary),transparent_60%)] opacity-[0.05] pointer-events-none" />

                <div className="w-full max-w-[380px] flex flex-col gap-9 relative z-10">
                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2.5">
                        <AppLogo />
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-400/20 rounded-full px-2.5 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Secure
                        </span>
                    </div>

                    {/* Page header */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
                        <p className="text-sm text-zinc-400 font-medium leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Form area */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
