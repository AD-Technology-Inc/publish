import * as React from "react";
import { AlertTriangle, Lock, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/core";
import { cn } from "@/lib/utils";

export const Problem: React.FC = () => {
    return (
        <section className="max-w-7xl mx-auto px-6 py-20">
            <div className="space-y-12">
                <div className="text-left max-w-3xl space-y-4">
                    <Badge
                        variant="outline"
                        className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-primary/25 text-primary bg-primary/5"
                    >
                        The Distributed Inconsistency Challenge
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                        Where standard publishing systems fail under
                        production pressure
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                        Standard job queues assume perfect conditions.
                        When real-world network latency, API rate
                        limits, or worker nodes crash, these systems
                        duplicate runs or drop messages completely.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        {
                            title: "Worker Node Outages",
                            description:
                                "A worker crashes mid-way through a publishing task. Standard queues either drop the message entirely, losing state, or re-run the whole workflow from scratch.",
                            icon: AlertTriangle,
                            color: "text-amber-500",
                        },
                        {
                            title: "Deduplication Leakage",
                            description:
                                "At-least-once queue delivery causes duplicates. Without coordination, multiple workers claim duplicates and write identical payloads, double-posting content.",
                            icon: Lock,
                            color: "text-rose-500",
                        },
                        {
                            title: "Rate Limit Cascades",
                            description:
                                "External platform APIs exhaust call limits, returning 429 Too Many Requests. Queue backlog skyrockets, blocking other active jobs in the queue.",
                            icon: Clock,
                            color: "text-blue-500",
                        },
                        {
                            title: "Partial execution redundancy",
                            description:
                                "A 3-step pipeline (prepare, upload, publish) crashes on the final step. On restart, the system re-executes steps 1 and 2, causing duplicate side effects.",
                            icon: RefreshCw,
                            color: "text-purple-500",
                        },
                    ].map((prob, i) => {
                        const Icon = prob.icon;
                        return (
                            <div
                                key={i}
                                className="p-6 rounded-2xl border border-border bg-muted/40 space-y-4 text-left hover:border-border/60 transition-colors"
                            >
                                <div
                                    className={cn(
                                        "p-2.5 rounded-lg w-fit bg-muted",
                                        prob.color,
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                                    {prob.title}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                    {prob.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
