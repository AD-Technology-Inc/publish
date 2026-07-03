import * as React from "react";
import { Badge } from "@/components/ui/badge";

export const TechStack: React.FC = () => {
    return (
        <section className="border-t border-border bg-muted/10 py-20 text-left">
            <div className="max-w-7xl mx-auto px-6">
                <div className="max-w-3xl space-y-4 mb-16">
                    <Badge
                        variant="outline"
                        className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-primary/25 text-primary bg-primary/5"
                    >
                        Technical Stack
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                        Fully aligned system technology stack
                    </h2>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                        Our stack is compiled of production-tested
                        frameworks to support high scalability.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        {
                            category: "Backend Engine",
                            tech: [
                                "FastAPI (Python 3.12+)",
                                "Asyncio Execution Loop",
                                "Pydantic Payload Validation",
                            ],
                        },
                        {
                            category: "Coordination & Queueing",
                            tech: [
                                "Redis Streams (Broker)",
                                "Consumer Group Offsets",
                                "Redis Lock Idempotency (SET NX)",
                            ],
                        },
                        {
                            category: "State Persistence",
                            tech: [
                                "PostgreSQL Database Pool",
                                "Isolated SQL service schemas",
                                "StateManager checkpoint tables",
                            ],
                        },
                        {
                            category: "Observability & Infrastructure",
                            tech: [
                                "Prometheus, Loki, Tempo, Grafana",
                                "OpenTelemetry Spans",
                                "Docker Compose Orchestration",
                            ],
                        },
                    ].map((st, i) => (
                        <div
                            key={i}
                            className="p-6 rounded-2xl border border-border bg-muted/40 space-y-4"
                        >
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                {st.category}
                            </h3>
                            <ul className="space-y-2">
                                {st.tech.map((t, idx) => (
                                    <li
                                        key={idx}
                                        className="text-xs font-bold text-foreground flex items-center gap-2"
                                    >
                                        <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                                        <span>{t}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
