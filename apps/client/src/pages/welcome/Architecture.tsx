import * as React from "react";
import { GitBranch, Database } from "lucide-react";
import { Badge } from "@/components/ui/core";

export const Architecture: React.FC = () => {
    return (
        <section
            id="under-the-hood"
            className="border-t border-border bg-muted/20 py-20"
        >
            <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="max-w-3xl space-y-4 mb-16 text-left mx-auto md:text-center">
                    <Badge
                        variant="outline"
                        className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-primary/25 text-primary bg-primary/5"
                    >
                        Architecture Blueprint
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                        Under the Hood of the Platform
                    </h2>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                        See how requests route through the API gateway,
                        stream across the transport layer, and process
                        through independent DB-coupled worker domains.
                    </p>
                </div>

                {/* Visual architecture diagram */}
                <div className="max-w-5xl mx-auto relative z-10">
                    {/* 3 Column Modular Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs font-mono font-extrabold text-left">
                        {/* Card 1: Ingestion */}
                        <div className="rounded-[2rem] border border-border bg-card/30 backdrop-blur-sm p-6 md:p-8 space-y-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-500 relative group overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                                    <span className="text-[10px] text-primary uppercase tracking-[0.2em]">
                                        01. Ingestion
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[11px] text-foreground uppercase tracking-wide mb-2">
                                            Ingress Clients
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                                            <div className="py-2.5 px-3 bg-zinc-950/60 border border-border/40 rounded-xl text-muted-foreground">
                                                Web App
                                            </div>
                                            <div className="py-2.5 px-3 bg-zinc-950/60 border border-border/40 rounded-xl text-muted-foreground">
                                                API / CLI
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-[11px] text-foreground uppercase tracking-wide">
                                            Gateway Stack
                                        </h4>
                                        <div className="p-3.5 bg-zinc-950/80 border border-border/60 rounded-2xl space-y-2">
                                            <div>
                                                <h5 className="text-[10px] text-foreground">
                                                    Traefik Proxy
                                                </h5>
                                                <span className="text-[9px] text-muted-foreground font-medium block mt-0.5">
                                                    Edge routing & path
                                                    mapping
                                                </span>
                                            </div>
                                            <div className="h-px bg-border/40" />
                                            <div>
                                                <h5 className="text-[10px] text-foreground">
                                                    FastAPI Gateway
                                                </h5>
                                                <span className="text-[9px] text-muted-foreground font-medium block mt-0.5">
                                                    Ingestion, auth &
                                                    validation
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Transport */}
                        <div className="rounded-[2rem] border border-border bg-card/30 backdrop-blur-sm p-6 md:p-8 space-y-6 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-500 relative group overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                                    <span className="text-[10px] text-blue-400 uppercase tracking-[0.2em]">
                                        02. Transport
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[11px] text-foreground uppercase tracking-wide mb-2">
                                            Message Queue
                                        </h4>
                                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                                            Redis Streams acts as an
                                            immutable journal, absorbing
                                            spikes in traffic and
                                            decoupling ingest rate from
                                            database updates.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-zinc-950/80 border border-border/60 rounded-2xl space-y-3">
                                        <span className="text-[9px] text-blue-400 uppercase tracking-widest block text-center">
                                            Active Streams
                                        </span>
                                        <div className="space-y-2 text-[9px]">
                                            <div className="p-2 bg-muted/60 border border-border/40 rounded-xl flex items-center gap-2">
                                                <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                                                <span>
                                                    stream:social-post
                                                </span>
                                            </div>
                                            <div className="p-2 bg-muted/60 border border-border/40 rounded-xl flex items-center gap-2">
                                                <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                                                <span>
                                                    stream:social-publish
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Execution */}
                        <div className="rounded-[2rem] border border-border bg-card/30 backdrop-blur-sm p-6 md:p-8 space-y-6 hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-500 relative group overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                                    <span className="text-[10px] text-purple-400 uppercase tracking-[0.2em]">
                                        03. Workers
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        {
                                            service: "identity-service",
                                            desc: "Auth, users & tokens",
                                            db: "identity-db",
                                        },
                                        {
                                            service:
                                                "social-post-service",
                                            desc: "Post content metadata",
                                            db: "social-post-db",
                                        },
                                        {
                                            service:
                                                "social-account-service",
                                            desc: "Account integrations",
                                            db: "social-account-db",
                                        },
                                        {
                                            service:
                                                "social-publish-service",
                                            desc: "Step execution & dispatch",
                                            db: "social-publish-db",
                                        },
                                    ].map((srv, idx) => (
                                        <div
                                            key={idx}
                                            className="p-2.5 rounded-xl border border-border bg-zinc-950/60 flex items-center justify-between gap-3 hover:border-purple-500/20 transition-all duration-300"
                                        >
                                            <div className="space-y-0.5">
                                                <span className="text-[8px] text-muted-foreground uppercase tracking-widest block">
                                                    Domain {idx + 1}
                                                </span>
                                                <span className="text-[10px] text-purple-400">
                                                    {srv.service}
                                                </span>
                                                <span className="text-[8px] text-muted-foreground font-medium block">
                                                    {srv.desc}
                                                </span>
                                            </div>
                                            <div className="px-2 py-1 bg-muted border border-border/40 rounded-lg text-orange-400 text-[8.5px] flex items-center gap-1 shrink-0">
                                                <Database className="w-3.5 h-3.5" />
                                                <span>
                                                    {srv.db.replace(
                                                        "-db",
                                                        "",
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
