import * as React from "react";
import {
    Activity,
    AlertTriangle,
    Database,
    GitBranch,
    Lock,
    Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const featuresList = [
    {
        title: "Redis Streams Job Transport",
        description:
            "Leverages Redis Streams with XADD and XREADGROUP for high-throughput, at-least-once distributed job processing across scaled consumer groups.",
        icon: GitBranch,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        title: "Idempotency Guard Boundaries",
        description:
            "Prevents duplicate side-effects under network retries and duplicate stream deliveries using Redis-based SET NX locks with a 24-hour TTL.",
        icon: Lock,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
    },
    {
        title: "Active Worker Leasing",
        description:
            "Acquires time-bounded processing leases on entries. Expired leases trigger automatic reclamation by the visibility timeout manager.",
        icon: Shield,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
    {
        title: "Durable State Checkpointing",
        description:
            "Multi-stage jobs persist progress via a StateManager in PostgreSQL. Interrupted workflows resume from the last successful checkpoint instead of restarting.",
        icon: Database,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
    },
    {
        title: "DLQ Isolation & Replay",
        description:
            "Routes failed jobs exceeding the 5-attempt retry limit or non-retryable logical errors to an isolated Dead Letter Queue for inspection and manual replay.",
        icon: AlertTriangle,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
    },
    {
        title: "Chaos Injection Framework",
        description:
            "Simulates production failure modes—including transient HTTP errors, latency, and Redis Token Bucket rate limiting—to validate cluster resilience.",
        icon: Activity,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
    },
];

export const Features: React.FC = () => {
    return (
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
            <div className="space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <Badge
                        variant="outline"
                        className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-primary/25 text-primary bg-primary/5"
                    >
                        Core Capabilities
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                        Engineered to handle production failure modes
                    </h2>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                        Every feature is mapped directly from coordination logic inside our microservices,
                        ensuring architectural credibility over market speculation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuresList.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={idx}
                                className="p-8 rounded-[2rem] border border-border bg-muted/20 text-left space-y-4 hover:border-border/60 transition-all group"
                            >
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
                                        feature.bg,
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", feature.color)} />
                                </div>
                                <h3 className="text-base font-extrabold text-foreground tracking-wider">
                                    {feature.title}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium opacity-85">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
