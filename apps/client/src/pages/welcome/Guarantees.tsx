import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/core";

export const Guarantees: React.FC = () => {
    return (
        <section
            id="reliability-guarantees"
            className="border-t border-border bg-muted/10 py-20 text-left"
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="max-w-3xl space-y-4 mb-16">
                    <Badge
                        variant="outline"
                        className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-primary/25 text-primary bg-primary/5"
                    >
                        System Guarantees
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                        High-integrity execution guarantees
                    </h2>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                        Operational structures compiled directly into
                        our runtime loop to enforce system integrity
                        under severe infrastructure pressure.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            title: "Fault Tolerance",
                            desc: "Stateless FastAPI API and worker components run inside independent Docker containers. Worker crashes trigger automatic lease expiration, reclaiming processing priority.",
                        },
                        {
                            title: "Retry Strategy",
                            desc: "Exponential backoff (1s → 5s → 25s → 125s) capped at 5 attempts. Error categories route failures into retryable (transient) and non-retryable logical exceptions.",
                        },
                        {
                            title: "Idempotency Guarantee",
                            desc: "Redis-based SET NX locking verifies unique client-provided keys on queue pickup, returning safely without execution on duplicate triggers.",
                        },
                        {
                            title: "Failure Isolation",
                            desc: "Jobs exceeding the maximum attempt count or hitting logical, non-retryable blocks isolate directly into a Dead Letter Queue (DLQ) stream to prevent pipeline blocks.",
                        },
                        {
                            title: "Backpressure Controls",
                            desc: "Consumer pool scaling limits parallel jobs, while Redis Token Bucket rate limiters buffer connections to third-party endpoints.",
                        },
                        {
                            title: "Horizontal Scaling",
                            desc: "Stateless workers leverage Redis Streams Consumer Groups (XREADGROUP) to partition and distribute messages across dynamically provisioned containers.",
                        },
                        {
                            title: "Observability Stack",
                            desc: "Grafana telemetry connects Loki logs, Tempo distributed trace IDs, and Prometheus consumer offsets for end-to-end processing transparency.",
                        },
                        {
                            title: "Consistency Model",
                            desc: "Strict database-per-service isolation prevents direct relational database coupling, leveraging eventual consistency synchronized through event processing.",
                        },
                    ].map((guar, i) => (
                        <div
                            key={i}
                            className="space-y-3 p-6 rounded-2xl border border-border/60 bg-muted/20"
                        >
                            <div className="flex items-center gap-2 text-foreground">
                                <ShieldCheck className="w-4.5 h-4.5 text-foreground shrink-0" />
                                <h3 className="text-xs font-black uppercase tracking-wider">
                                    {guar.title}
                                </h3>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                {guar.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
