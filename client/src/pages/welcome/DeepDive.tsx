import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Architectural elements for tabs
const deepDiveTabs = [
    {
        id: "execution",
        label: "Async Ingestion & Transport",
        title: "At-Least-Once Delivery Model via Redis Streams",
        desc: "AD. Publish replaces traditional heavyweight queue brokers with Redis Streams, balancing operational simplicity with strict coordination guarantees.",
        bullets: [
            "FastAPI producers enqueue jobs using XADD, returning a tracking ID immediately to the client to decouple ingestion from execution.",
            "Workers participate in distributed Consumer Groups via XREADGROUP to partition stream streams without centralized coordination.",
            "Strict visibility timeouts prevent split-brain processing while ensuring crashed workers automatically release locked messages.",
        ],
        code: `// Enqueuing a job to Redis Streams
async def enqueue_job(service: str, payload: dict, key: str):
    job_id = str(uuid.uuid4())
    job_data = {
        "id": job_id,
        "key": key,
        "payload": json.dumps(payload),
        "status": "QUEUED",
        "attempt": 0
    }
    # Add to stream
    await redis.xadd(f"stream:{service}", job_data)
    return job_id`,
    },
    {
        id: "deduplication",
        label: "Deduplication Boundary",
        title: "Distributed Locks & Idempotency Key Routing",
        desc: "At-least-once systems guarantees delivery but invites duplicate execution. AD. Publish handles deduplication deterministically at the application layer.",
        bullets: [
            "Jobs require a client-generated UUID idempotency key. Duplicate keys are captured at worker boundaries before executing any logic.",
            "Uses atomic Redis SET NX locks with a sliding TTL (default 24h) to coordinate execution states (PROCESSING vs. SUCCESS).",
            "Under retry storms or duplicate API calls, the lock rejects execution early, safely skipping duplicate processing paths.",
        ],
        code: `// Idempotency lock check
async def acquire_lock(redis, key: str, ttl: int = 86400) -> bool:
    lock_key = f"idempotency:{key}"
    # Atomically set if not exists
    acquired = await redis.set(
        lock_key, "PROCESSING", 
        nx=True, ex=ttl
    )
    return bool(acquired)`,
    },
    {
        id: "checkpointing",
        label: "Resumable Workflows",
        title: "State Manager Checkpointing & Recovery",
        desc: "Complex multi-step jobs (e.g. processing image, uploading, posting to API) are highly vulnerable to partial system failures.",
        bullets: [
            "Each microservice maintains an isolated PostgreSQL database to prevent database-level cross-service coupling.",
            "A central StateManager writes checkpoint markers after each step succeeds. If a step fails, retry parameters flag the error.",
            "On subsequent worker pickup, execution queries previous step logs and skips completed side-effects, resolving partial run duplication.",
        ],
        code: `// Resuming from checkpoints
async def execute_job_steps(job):
    state = await state_manager.get_checkpoint(job.id)
    if state.step_1 == "PENDING":
        await run_step_1(job)
        await state_manager.mark_complete(job.id, "step_1")
        
    if state.step_2 == "PENDING":
        await run_step_2(job)
        await state_manager.mark_complete(job.id, "step_2")`,
    },
    {
        id: "observability",
        label: "Observability & Tracing",
        title: "Full Distributed Telemetry Suite",
        desc: "Unifying async queues, APIs, and detached workers is impossible without synchronized metrics, logging, and trace mapping.",
        bullets: [
            "OpenTelemetry spans instrument microservices, generating trace data pushed to Tempo for distributed end-to-end trace tracking.",
            "Prometheus gathers low-level metrics on consumer group lag, worker queue latency, and rate limiter capacities.",
            "Loki captures structural logs directly from FastAPI and Python workers, linking trace IDs directly to warning and exception contexts.",
        ],
        code: `# OpenTelemetry Instrumentation hook
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

tracer = trace.get_tracer("publish-worker")

with tracer.start_as_current_span("worker-job-execution") as span:
    span.set_attribute("job.id", job_id)
    span.set_attribute("job.idempotency_key", key)
    # Execute job step logic`,
    },
];

export const DeepDive: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState<string>("execution");

    return (
        <section
            id="engineering-deep-dive"
            className="max-w-7xl mx-auto px-6 py-20 text-left"
        >
            <div className="space-y-12">
                <div className="space-y-4 max-w-3xl">
                    <Badge
                        variant="outline"
                        className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-primary/25 text-primary bg-primary/5"
                    >
                        Engineering Deep Dive
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                        Technical trade-offs & execution choices
                    </h2>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                        Review our engineering justifications and coordination choices compared to traditional
                        messaging architectures.
                    </p>
                </div>

                {/* Interactive Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left panel tabs selection */}
                    <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-2.5">
                        {deepDiveTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "p-4 rounded-xl border text-left transition-all duration-300 font-mono text-xs font-black uppercase tracking-wider",
                                    activeTab === tab.id
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-zinc-950 bg-muted/40 text-muted-foreground hover:text-foreground hover:border-border",
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Right panel selected tab content */}
                    <div className="lg:col-span-8 p-8 rounded-[2rem] border border-border bg-muted/20 space-y-6">
                        {deepDiveTabs.map((tab) => {
                            if (tab.id !== activeTab) return null;
                            return (
                                <div
                                    key={tab.id}
                                    className="space-y-6 animate-in fade-in duration-300"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-extrabold text-foreground">
                                            {tab.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                            {tab.desc}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {tab.bullets.map((bullet, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-3 text-xs text-foreground"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                                <p className="leading-relaxed font-medium">
                                                    {bullet}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="rounded-xl border border-border bg-background overflow-hidden">
                                        <div className="bg-zinc-950 px-4 py-2 border-b border-border text-[10px] font-mono text-muted-foreground text-left">
                                            Source Implementation
                                        </div>
                                        <div className="p-4 font-mono text-[11px] text-muted-foreground text-left overflow-x-auto">
                                            <pre>{tab.code}</pre>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
