import * as React from "react";
import { AppLogo } from "@/components/AppLogo";
import { Badge } from "@/components/ui/core";
import { ShieldCheck, Zap } from "lucide-react";

interface Props {
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export const AuthLayout: React.FC<Props> = ({
    title,
    description,
    children,
}) => {
    return (
        <div className="flex min-h-screen bg-zinc-950 font-sans overflow-hidden">
            {/* Left Column: Premium Interactive Showcase (Hidden on mobile/tablet) */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative flex-col justify-between p-12 border-r border-border bg-black/40">
                {/* Cyber Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,var(--accent),transparent_70%)] opacity-[0.08] pointer-events-none" />
                
                {/* Header */}
                <div className="flex items-center gap-3 relative z-10">
                    <AppLogo />
                    <Badge
                        variant="outline"
                        className="text-[9px] font-mono py-0.5 px-2.5 rounded-full border-border text-emerald-400 bg-emerald-950/20 flex items-center gap-1.5"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Secure Connection</span>
                    </Badge>
                </div>

                {/* Middle: Interactive Tech Visual (Terminal Mock + Features) */}
                <div className="my-auto space-y-12 relative z-10 max-w-lg">
                    <div className="space-y-4 text-left">
                        <span className="text-[10px] text-accent uppercase tracking-[0.2em] font-mono font-black">
                            Reliability Engine
                        </span>
                        <h2 className="text-3xl xl:text-4xl font-extrabold text-foreground tracking-tight leading-none">
                            Next-gen distributed coordination.
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                            Deploy high-frequency pipelines without worrying about resource locks, message loss, or down-time. Built on modern FastAPI, Redis Streams, and PostgreSQL.
                        </p>
                    </div>

                    {/* Simulated terminal logs */}
                    <div className="rounded-2xl border border-border bg-zinc-900/60 backdrop-blur-md p-5 font-mono text-[10px] text-left space-y-3.5 shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
                            </div>
                            <span className="text-muted-foreground/60 text-[9px]">cluster-logs</span>
                        </div>
                        <div className="space-y-1.5 text-muted-foreground font-medium">
                            <p className="flex items-center gap-2">
                                <span className="text-accent">●</span>
                                <span>[ingress-gateway] edge routing initialized</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-blue-400">●</span>
                                <span>[redis-streams] client buffer established (0.02ms latency)</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-purple-400">●</span>
                                <span>[social-publish-service] worker group registered</span>
                            </p>
                            <p className="flex items-center gap-2 text-green-400">
                                <span>$</span>
                                <span className="animate-pulse">listening for telemetry events...</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Features List */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono font-bold text-left">
                        <div className="flex items-start gap-2.5">
                            <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-foreground font-extrabold uppercase text-[9px] tracking-wider">Sub-ms Latency</h4>
                                <p className="text-muted-foreground text-[10px] font-medium leading-normal mt-0.5">Stream processing via memory journal.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-foreground font-extrabold uppercase text-[9px] tracking-wider">Zero Lockouts</h4>
                                <p className="text-muted-foreground text-[10px] font-medium leading-normal mt-0.5">Decoupled ingestion routes.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-[10px] text-muted-foreground/60 font-mono text-left">
                    © 2026 AD. Publish. All rights reserved.
                </div>
            </div>

            {/* Right Column: Form Panel */}
            <div className="w-full lg:w-[55%] xl:w-[50%] flex flex-col justify-center items-center p-6 md:p-12 relative bg-zinc-950">
                {/* Background ambient glow for mobile */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent),transparent_60%)] opacity-[0.04] lg:hidden pointer-events-none" />
                
                <div className="w-full max-w-sm flex flex-col gap-8 relative z-10">
                    <div className="flex flex-col items-center gap-4">
                        {/* Logo visible only on mobile/tablet */}
                        <div className="flex lg:hidden items-center gap-2 font-medium">
                            <AppLogo />
                            <Badge
                                variant="outline"
                                className="text-[9px] font-mono py-0.5 px-2.5 rounded-full border-border text-emerald-400 bg-emerald-950/20 flex items-center gap-1.5"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>Secure</span>
                            </Badge>
                        </div>
                        
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-black tracking-tight text-foreground">{title}</h1>
                            <p className="text-sm text-muted-foreground font-medium">
                                {description}
                            </p>
                        </div>
                    </div>
                    
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
