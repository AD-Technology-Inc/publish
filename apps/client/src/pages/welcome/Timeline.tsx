import * as React from "react";
import { Server, Settings, Play, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Timeline: React.FC = () => {
    return (
        <section className="border-t border-border bg-muted/10 py-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-left max-w-3xl space-y-4 mb-16">
                    <Badge
                        variant="outline"
                        className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-primary/25 text-primary bg-primary/5"
                    >
                        Operational Lifecycle
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                        The Ingestion-to-Observation Pipeline
                    </h2>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                        Trace the flow of job coordinates from initial
                        HTTP request parsing down to trace and metrics
                        collection.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    {/* Lines connecting timeline steps (only visible on large screens) */}
                    <div className="hidden md:block absolute top-12 left-12 right-12 h-px bg-muted -z-10"></div>

                    {[
                        {
                            step: "01",
                            title: "Create & Ingest",
                            desc: "FastAPI gateway ingests publish payload, validates headers, appends state parameters, and accepts payload asynchronously.",
                            icon: Server,
                            badge: "HTTP POST",
                        },
                        {
                            step: "02",
                            title: "Configure & Stream",
                            desc: "The payload is paired with a client-supplied unique Idempotency Key and retry config, then pushed to Redis Streams (XADD).",
                            icon: Settings,
                            badge: "Redis Stream",
                        },
                        {
                            step: "03",
                            title: "Execute & Persist",
                            desc: "Leasing locks isolate executions. Consumer workers run operations step-by-step, logging milestones via PostgreSQL checkpoints.",
                            icon: Play,
                            badge: "Workers + DB",
                        },
                        {
                            step: "04",
                            title: "Observe & Trace",
                            desc: "Prometheus metrics register stream latency, while Loki and Tempo bundle distributed traces to track execution paths.",
                            icon: Eye,
                            badge: "Grafana Stack",
                        },
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                className="space-y-4 text-left bg-zinc-950/30 p-6 rounded-2xl border border-border/60 relative"
                            >
                                <div className="absolute top-4 right-4 text-[10px] font-mono text-muted-foreground font-extrabold">
                                    {item.badge}
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-muted/80 flex items-center justify-center border border-border/60 text-foreground font-mono text-sm font-extrabold relative">
                                    <Icon className="w-5 h-5 text-muted-foreground" />
                                    <span className="absolute -bottom-1 -right-1 bg-white text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-widest">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                    {item.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
