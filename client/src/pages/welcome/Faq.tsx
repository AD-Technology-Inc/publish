import * as React from "react";
import { Badge } from "@/components/ui/badge";

export const Faq: React.FC = () => {
    return (
        <section
            id="pricing-roadmap"
            className="border-t border-border bg-[#070708] py-20 text-left"
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="space-y-12">
                    <div className="space-y-3">
                        <Badge
                            variant="outline"
                            className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-primary/25 text-primary bg-primary/5"
                        >
                            Developer FAQ
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                            Under the Hood Inquiries
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        {[
                            {
                                q: "Why use Redis Streams instead of Celery/RabbitMQ?",
                                a: "Celery introduces heavy task state tracking overhead and RabbitMQ requires separate AMQP management. Redis Streams delivers high message throughput via Consumer Groups while serving as a fast cache for lease management and idempotency checks.",
                            },
                            {
                                q: "How does step checkpointing work during worker failure?",
                                a: "Our StateManager logs each checkpoint step (e.g. step_1, step_2) to PostgreSQL before execution continues. When a crashed job is re-acquired, the worker queries PostgreSQL and skips already completed steps.",
                            },
                            {
                                q: "How is idempotency guaranteed if Redis goes down?",
                                a: "Redis is the primary speed layer for deduplication. If Redis goes down, database-level unique constraints in PostgreSQL serve as a durable secondary boundary, rejecting duplicate record inserts.",
                            },
                            {
                                q: "Can DLQ jobs be replayed automatically?",
                                a: "No. To prevent cascading failures under retry storms, failed entries are isolated to the DLQ stream. Developers must explicitly trigger replay via the Gateway POST /dlq/{service}/{job_id}/replay endpoint.",
                            },
                        ].map((faq, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl border border-border/40 bg-card/25 hover:border-primary/15 transition-all duration-300 space-y-2"
                            >
                                <h4 className="text-sm font-extrabold text-foreground">
                                    {faq.q}
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
