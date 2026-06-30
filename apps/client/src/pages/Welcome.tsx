import * as React from "react";
import { Link } from "react-router-dom";
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock,
    Database,
    Eye,
    GitBranch,
    Lock,
    Play,
    RefreshCw,
    Server,
    Settings,
    Shield,
    ShieldCheck,
    Terminal,
    ChevronRight,
    Star,
    Check,
    Copy,
} from "lucide-react";
import { useTitle } from "@/hooks/use-title";
import { AppLogo } from "@/components/AppLogo";
import { Button, Badge } from "@/components/ui/core";
import { cn } from "@/lib/utils";

// Inline SVG GithubIcon for compilation reliability
const GithubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" {...props}>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"
        />
    </svg>
);

// Features from repository implementation
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

tracer = trace.get_tracer("posexei-worker")

with tracer.start_as_current_span("worker-job-execution") as span:
    span.set_attribute("job.id", job_id)
    span.set_attribute("job.idempotency_key", key)
    # Execute job step logic`,
    },
];

export const Welcome: React.FC = () => {
    useTitle("Distributed Publishing Platform");

    // Simulation states
    const [simType, setSimType] = React.useState<
        "normal" | "crash" | "duplicate" | "ratelimit"
    >("normal");
    const [simLogs, setSimLogs] = React.useState<string[]>([]);
    const [isSimulating, setIsSimulating] = React.useState<boolean>(false);
    const [copied, setCopied] = React.useState<boolean>(false);
    const handleCopy = () => {
        navigator.clipboard.writeText("docker compose up --build -d");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Virtual architecture variables
    const [gatewayState, setGatewayState] = React.useState<
        "idle" | "processing" | "error"
    >("idle");
    const [streamQueue, setStreamQueue] = React.useState<string[]>([]);
    const [activeWorker, setActiveWorker] = React.useState<
        "Worker-A" | "Worker-B" | "None"
    >("None");
    const [workerAStatus, setWorkerAStatus] = React.useState<
        | "Idle"
        | "Leasing"
        | "Step 1"
        | "Step 2"
        | "Step 3"
        | "Crashed"
        | "Success"
    >("Idle");
    const [workerBStatus, setWorkerBStatus] = React.useState<
        "Idle" | "Leasing" | "Step 1" | "Step 2" | "Step 3" | "Success"
    >("Idle");
    const [redisLock, setRedisLock] = React.useState<
        "Empty" | "Locked (PROCESSING)" | "Locked (SUCCESS)"
    >("Empty");
    const [dbState, setDbState] = React.useState<
        "Empty" | "Step 1 Saved" | "Step 2 Saved" | "All Steps Completed"
    >("Empty");
    const [dlqState, setDlqState] = React.useState<"Empty" | "Job In DLQ">(
        "Empty",
    );

    // Tab selection
    const [activeTab, setActiveTab] = React.useState<string>("execution");

    // Helper: append log
    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        setSimLogs((prev) => [...prev, `[${time}] ${msg}`]);
    };

    // Run simulation handler
    const runSimulation = async (
        type: "normal" | "crash" | "duplicate" | "ratelimit",
    ) => {
        if (isSimulating) return;
        setSimType(type);
        setIsSimulating(true);
        setSimLogs([]);

        // Reset states
        setGatewayState("idle");
        setStreamQueue([]);
        setActiveWorker("None");
        setWorkerAStatus("Idle");
        setWorkerBStatus("Idle");
        setRedisLock("Empty");
        setDbState("Empty");
        setDlqState("Empty");

        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

        if (type === "normal") {
            // STEP 0: Ingestion
            setGatewayState("processing");
            addLog("POST /posts received at Gateway API...");
            addLog("Generating job payload. Idempotency Key: idem_key_norm_45");
            await delay(1200);

            // STEP 1: Queueing
            setGatewayState("idle");
            setStreamQueue(["job_norm_01"]);
            addLog(
                "XADD: Pushed job_norm_01 into Redis Stream 'stream:social-publish'",
            );
            await delay(1200);

            // STEP 2: Leasing & Locks
            setStreamQueue([]);
            setActiveWorker("Worker-A");
            setWorkerAStatus("Leasing");
            addLog(
                "XREADGROUP: Worker-A acquired message lease. Group: publish-workers",
            );
            addLog("Redis check: SET NX key: idem_key_norm_45");
            setRedisLock("Locked (PROCESSING)");
            addLog(
                "Idempotency lock acquired (PROCESSING). Starting step execution.",
            );
            await delay(1500);

            // STEP 3: Execution & Checkpoints
            setWorkerAStatus("Step 1");
            addLog("Worker-A executing Step 1: Create local publish entity.");
            setDbState("Step 1 Saved");
            addLog("StateManager: Step 1 checkpoint saved in PostgreSQL.");
            await delay(1200);

            setWorkerAStatus("Step 2");
            addLog(
                "Worker-A executing Step 2: Upload assets to external media storage.",
            );
            setDbState("Step 2 Saved");
            addLog("StateManager: Step 2 checkpoint saved in PostgreSQL.");
            await delay(1200);

            setWorkerAStatus("Step 3");
            addLog("Worker-A executing Step 3: Triggering platform webhooks.");
            setDbState("All Steps Completed");
            addLog("StateManager: Step 3 checkpoint saved in PostgreSQL.");
            await delay(1200);

            // STEP 4: Success & Acknowledge
            setWorkerAStatus("Success");
            setRedisLock("Locked (SUCCESS)");
            addLog(
                "Redis update: Idempotency lock updated to SUCCESS (TTL: 24h).",
            );
            addLog("XACK: Worker-A acknowledged job processing completion.");
            addLog("Job job_norm_01 finished successfully with 0 retries.");
            setGatewayState("idle");
        } else if (type === "crash") {
            // STEP 0: Ingestion
            setGatewayState("processing");
            addLog("POST /posts received at Gateway API...");
            addLog(
                "Generating job payload. Idempotency Key: idem_key_crash_99",
            );
            await delay(1000);

            // STEP 1: Queueing
            setGatewayState("idle");
            setStreamQueue(["job_crash_02"]);
            addLog(
                "XADD: Pushed job_crash_02 into Redis Stream 'stream:social-publish'",
            );
            await delay(1000);

            // STEP 2: Worker A leases and begins steps
            setStreamQueue([]);
            setActiveWorker("Worker-A");
            setWorkerAStatus("Leasing");
            setRedisLock("Locked (PROCESSING)");
            addLog(
                "XREADGROUP: Worker-A leased message. Idempotency lock set to PROCESSING.",
            );
            await delay(1200);

            setWorkerAStatus("Step 1");
            addLog(
                "Worker-A executing Step 1: Initialize local publish metadata.",
            );
            setDbState("Step 1 Saved");
            addLog("StateManager: Step 1 checkpoint persisted in PostgreSQL.");
            await delay(1200);

            // CRASH INJECTION
            setWorkerAStatus("Crashed");
            addLog(
                "⚠️ CRASH INJECTED: Worker-A killed mid-execution (SIGKILL simulation).",
            );
            addLog(
                "Lease remains active in pending list (PEL). Processing paused.",
            );
            await delay(2500);

            // STEP 3: Lease Reclamation & Worker B Takeover
            addLog(
                "Visibility timeout expired. Autoclaim manager re-exposes job_crash_02.",
            );
            setActiveWorker("Worker-B");
            setWorkerBStatus("Leasing");
            addLog("XREADGROUP: Worker-B leases the orphaned job_crash_02.");
            await delay(1500);

            setWorkerBStatus("Step 1");
            addLog(
                "Worker-B checks StateManager: Step 1 completed. SKIPPING STEP 1.",
            );
            await delay(1500);

            setWorkerBStatus("Step 2");
            addLog("Worker-B resuming from Step 2: Upload assets.");
            setDbState("Step 2 Saved");
            addLog("StateManager: Step 2 checkpoint saved in PostgreSQL.");
            await delay(1200);

            setWorkerBStatus("Step 3");
            addLog("Worker-B executing Step 3: Trigger platform API calls.");
            setDbState("All Steps Completed");
            addLog("StateManager: Step 3 checkpoint saved in PostgreSQL.");
            await delay(1200);

            // STEP 4: Acknowledge
            setWorkerBStatus("Success");
            setRedisLock("Locked (SUCCESS)");
            addLog("Redis update: Lock status updated to SUCCESS.");
            addLog(
                "XACK: Worker-B acknowledged job_crash_02. Removed from stream pending list.",
            );
            addLog(
                "Job job_crash_02 recovered successfully with no duplicate side-effects!",
            );
        } else if (type === "duplicate") {
            // STEP 0: First Job Ingested
            setGatewayState("processing");
            addLog("POST /posts received at Gateway API (Request 1)...");
            addLog("Idempotency Key: idem_key_dup_77");
            await delay(1000);

            setGatewayState("idle");
            setStreamQueue(["job_first_03"]);
            addLog("XADD: Pushed job_first_03 into stream.");
            await delay(1000);

            setStreamQueue([]);
            setActiveWorker("Worker-A");
            setWorkerAStatus("Leasing");
            setRedisLock("Locked (PROCESSING)");
            addLog(
                "Worker-A leased job_first_03. Idempotency lock set to PROCESSING.",
            );
            await delay(1200);

            setWorkerAStatus("Step 1");
            addLog("Worker-A processing Step 1: Create local publish entity.");
            setDbState("Step 1 Saved");
            await delay(1000);

            // SECOND REQUEST SENT (RETRY STORM)
            addLog(
                "⚡ RETRY STORM: Client sends duplicate POST /posts with same Idempotency Key (Request 2)...",
            );
            setGatewayState("processing");
            await delay(1000);

            addLog(
                "Gateway checks Redis idempotency lock for key 'idem_key_dup_77'...",
            );
            addLog("Redis Response: Key is in PROCESSING state.");
            setGatewayState("error");
            addLog(
                "❌ DEDUPLICATED: Gateway rejects Request 2. Returned HTTP 409 Conflict / Ignored.",
            );
            await delay(1500);

            // Resume Worker A
            setGatewayState("idle");
            setWorkerAStatus("Step 2");
            addLog("Worker-A continues executing Step 2.");
            setDbState("Step 2 Saved");
            await delay(1000);

            setWorkerAStatus("Step 3");
            setDbState("All Steps Completed");
            await delay(1000);

            setWorkerAStatus("Success");
            setRedisLock("Locked (SUCCESS)");
            addLog(
                "Worker-A acknowledges job_first_03. Lock updated to SUCCESS (TTL 24h).",
            );
            addLog("Duplicate execution averted safely.");
        } else if (type === "ratelimit") {
            // STEP 0: Ingest
            setGatewayState("processing");
            addLog("POST /posts received at Gateway API...");
            addLog("Generating job payload. Idempotency Key: idem_key_rate_11");
            await delay(1000);

            // STEP 1: Queueing
            setGatewayState("idle");
            setStreamQueue(["job_rate_04"]);
            addLog("XADD: Pushed job_rate_04 to stream.");
            await delay(1000);

            // STEP 2: Execution
            setStreamQueue([]);
            setActiveWorker("Worker-A");
            setWorkerAStatus("Leasing");
            setRedisLock("Locked (PROCESSING)");
            addLog("Worker-A leased job. Idempotency lock set to PROCESSING.");
            await delay(1200);

            setWorkerAStatus("Step 1");
            setDbState("Step 1 Saved");
            await delay(1000);

            setWorkerAStatus("Step 2");
            setDbState("Step 2 Saved");
            await delay(1000);

            // RATE LIMIT HIT
            setWorkerAStatus("Leasing"); // Back to coordination loop
            addLog(
                "Worker-A executing Step 3: Trigger external platform API publishing.",
            );
            addLog(
                "⚠️ EXTERNAL API ERROR: Received HTTP 429 Too Many Requests (Token Bucket exhausted).",
            );
            addLog(
                "Error classified as RETRYABLE. Incrementing attempt_count to 1.",
            );
            addLog("Calculating backoff: Delaying next run for 3 seconds.");
            setWorkerAStatus("Idle");
            await delay(3000);

            // RETRY RUN
            setWorkerAStatus("Leasing");
            addLog("Backoff elapsed. Worker-A re-acquires job lease.");
            addLog("Checking state checkpoints: Step 1 & Step 2 completed.");
            await delay(1200);

            setWorkerAStatus("Step 3");
            addLog(
                "Worker-A resumes Step 3: External platform API calls (tokens replenished).",
            );
            setDbState("All Steps Completed");
            await delay(1200);

            setWorkerAStatus("Success");
            setRedisLock("Locked (SUCCESS)");
            addLog(
                "XACK: Job acknowledged. Job processing completed after 1 retry.",
            );
        }

        setIsSimulating(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AppLogo />
                        <Badge
                            variant="outline"
                            className="text-[9px] font-mono py-0 px-2 rounded-full border-border text-muted-foreground bg-muted"
                        >
                            v0.1.0 - PRE-ALPHA
                        </Badge>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        <a
                            href="#features"
                            className="hover:text-foreground transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#interactive-simulator"
                            className="hover:text-foreground transition-colors"
                        >
                            Simulator
                        </a>
                        <a
                            href="#reliability-guarantees"
                            className="hover:text-foreground transition-colors"
                        >
                            Guarantees
                        </a>
                        <a
                            href="#under-the-hood"
                            className="hover:text-foreground transition-colors"
                        >
                            Architecture
                        </a>
                        <a
                            href="#engineering-deep-dive"
                            className="hover:text-foreground transition-colors"
                        >
                            Deep Dive
                        </a>
                        <a
                            href="#pricing-roadmap"
                            className="hover:text-foreground transition-colors"
                        >
                            FAQ
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            <Button
                                variant="ghost"
                                className="font-bold text-[11px] uppercase tracking-widest px-4 h-9"
                            >
                                Log in
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button
                                variant="accent"
                                className="font-black rounded-lg text-[11px] uppercase tracking-widest px-5 h-9 shadow-sm shadow-accent/15"
                            >
                                Launch App
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-24">
                {/* HERO SECTION */}
                <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 text-center">
                    {/* Glowing effect */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-muted rounded-full blur-[120px] pointer-events-none -z-10"></div>

                    <div className="space-y-8 max-w-4xl mx-auto">
                        <Badge
                            variant="outline"
                            className="rounded-full py-1 px-4 text-[10px] font-mono uppercase tracking-[0.2em] border-accent/25 text-accent bg-accent/5"
                        >
                            Distributed Publishing Engine
                        </Badge>

                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground">
                            Reliable async publishing <br />
                            <span className="text-accent">
                                engineered for failure safety.
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
                            AD. Publish is a high-integrity publishing platform
                            that guarantees at-least-once delivery,
                            application-level idempotency, and automated crash
                            recovery. Built on FastAPI, Redis Streams, and
                            PostgreSQL to coordinate multi-stage publication
                            steps under real-world cluster conditions.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="accent"
                                    className="w-full sm:w-auto rounded-lg h-12 px-8 text-xs font-black uppercase tracking-widest gap-2 shadow-lg shadow-accent/15"
                                >
                                    Start Live Demo{" "}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <a
                                href="https://github.com/zerexei/posexei"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto"
                            >
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto rounded-lg h-12 px-8 text-xs font-black uppercase tracking-widest gap-2"
                                >
                                    <GithubIcon /> GitHub Repository
                                </Button>
                            </a>
                            <a
                                href="#engineering-deep-dive"
                                className="w-full sm:w-auto"
                            >
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className="w-full sm:w-auto rounded-lg h-12 px-8 text-xs font-black uppercase tracking-widest gap-2"
                                >
                                    <BookOpen className="w-4 h-4" /> Engineering
                                    Notes
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>

                {/* CAPABILITY STRIP */}
                <section className="border-y border-border bg-muted/20 py-8">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
                            {[
                                {
                                    title: "At-Least-Once Delivery",
                                    desc: "Deduplicated execution boundary via Redis lock.",
                                },
                                {
                                    title: "Zero-Lease Contention",
                                    desc: "Explicit worker leasing with visibility timeouts.",
                                },
                                {
                                    title: "Fault-Isolated Streams",
                                    desc: "Unrecoverable jobs route immediately to DLQ.",
                                },
                                {
                                    title: "Resumable Checkpoints",
                                    desc: "StateManager saves progress in isolated DBs.",
                                },
                            ].map((cap, i) => (
                                <div
                                    key={i}
                                    className="pt-6 md:pt-0 md:px-6 first:pt-0 first:pl-0 text-left space-y-1"
                                >
                                    <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                                        {cap.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {cap.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PROBLEM STATEMENT */}
                <section className="max-w-7xl mx-auto px-6 py-20">
                    <div className="space-y-12">
                        <div className="text-left max-w-3xl space-y-4">
                            <Badge
                                variant="outline"
                                className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-accent/25 text-accent bg-accent/5"
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

                {/* SOLUTION ARCHITECTURE */}
                <section className="border-t border-border bg-muted/10 py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            <div className="lg:col-span-5 space-y-6 text-left">
                                <Badge
                                    variant="outline"
                                    className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-accent/25 text-accent bg-accent/5"
                                >
                                    Defensive Architecture
                                </Badge>
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                                    AD. Publish: A Coordinate-First System
                                    Blueprint
                                </h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    AD. Publish implements structural
                                    coordination locks, step checkpointing, and
                                    isolated microservice storage directly at
                                    the application boundary.
                                </p>
                                <div className="space-y-4 pt-4">
                                    {[
                                        "Client-driven unique idempotency keys validated at worker entry.",
                                        "Explicit leasing locks in Redis avoid multi-worker execution collisions.",
                                        "StateManager logs progress database checkpoints dynamically.",
                                        "Docker-contained stateless services scale to accommodate queue load.",
                                    ].map((sol, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3"
                                        >
                                            <div className="p-1 rounded-full bg-zinc-950 mt-1 border border-border/60 text-foreground">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </div>
                                            <p className="text-xs text-foreground font-medium leading-relaxed">
                                                {sol}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Code snippet block */}
                            <div className="lg:col-span-7">
                                <div className="rounded-xl border border-border bg-background overflow-hidden shadow-2xl">
                                    <div className="bg-card px-4 py-3 border-b border-border flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-muted"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-muted"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-muted"></div>
                                        </div>
                                        <span className="text-[10px] font-mono text-muted-foreground">
                                            services/worker/executor.py
                                        </span>
                                    </div>
                                    <div className="p-6 text-left font-mono text-xs overflow-x-auto text-foreground">
                                        <pre>{`async def process_publishing_job(self, job_id: str, idempotency_key: str):
    # 1. Acquire distributed lease lock
    leased = await self.lease_manager.acquire(job_id, duration=30)
    if not leased:
        logger.warning(f"Job {job_id} already leased. Skipping.")
        return

    # 2. Assert idempotency boundary
    is_unique = await self.idempotency.set_processing(idempotency_key)
    if not is_unique:
        logger.info(f"Duplicate key detected: {idempotency_key}. Discarding.")
        return

    # 3. Fetch/initialize state checkpoint
    checkpoint = await self.db.get_checkpoint(job_id)
    
    # 4. Resume execution from checkpoint
    try:
        await self.execute_steps(job_id, checkpoint)
        await self.idempotency.set_success(idempotency_key)
        await self.acknowledge_stream(job_id)
    except Exception as e:
        await self.handle_failure(job_id, e)`}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES GRID */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-20">
                    <div className="space-y-12">
                        <div className="text-center max-w-2xl mx-auto space-y-4">
                            <Badge
                                variant="outline"
                                className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-accent/25 text-accent bg-accent/5"
                            >
                                Core Capabilities
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                                Engineered to handle production failure modes
                            </h2>
                            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                                Every feature is mapped directly from
                                coordination logic inside our microservices,
                                ensuring architectural credibility over market
                                speculation.
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
                                            <Icon
                                                className={cn(
                                                    "w-5 h-5",
                                                    feature.color,
                                                )}
                                            />
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

                {/* HOW IT WORKS */}
                <section className="border-t border-border bg-muted/10 py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-left max-w-3xl space-y-4 mb-16">
                            <Badge
                                variant="outline"
                                className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-accent/25 text-accent bg-accent/5"
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

                {/* INTERACTIVE SIMULATOR SANDBOX */}
                <section
                    id="interactive-simulator"
                    className="max-w-7xl mx-auto px-6 py-20"
                >
                    <div className="space-y-12">
                        <div className="text-center max-w-2xl mx-auto space-y-4">
                            <Badge
                                variant="outline"
                                className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-accent/25 text-accent bg-accent/5"
                            >
                                Simulation Sandbox
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                                Test system resilience in real-time
                            </h2>
                            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                                Inject failures, trigger duplicate requests, or
                                exhaust rate limits to watch AD. Publish's
                                coordination state machine recover step
                                checkpoints.
                            </p>
                        </div>

                        {/* Interactive Widget Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                            {/* Controller & Scenarios Panel */}
                            <div className="lg:col-span-4 rounded-2xl border border-border bg-muted/40 p-6 flex flex-col justify-between text-left space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        Simulation Scenarios
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            {
                                                id: "normal",
                                                title: "Normal Flow Execution",
                                                desc: "Runs ingestion, checks unique idempotency, and records step progress.",
                                            },
                                            {
                                                id: "crash",
                                                title: "Worker Crash & Resumption",
                                                desc: "Worker-A dies mid-step. Worker-B leases and resumes from SQL checkpoint.",
                                            },
                                            {
                                                id: "duplicate",
                                                title: "Retry Storm Deduplication",
                                                desc: "Fires duplicate requests mid-run. Lock filters duplicates immediately.",
                                            },
                                            {
                                                id: "ratelimit",
                                                title: "API Throttling & Backoff",
                                                desc: "Simulates HTTP 429 rate limit. Backs off exponentially, then retries.",
                                            },
                                        ].map((sc) => (
                                            <button
                                                key={sc.id}
                                                onClick={() =>
                                                    !isSimulating &&
                                                    setSimType(sc.id as any)
                                                }
                                                disabled={isSimulating}
                                                className={cn(
                                                    "p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden disabled:opacity-60",
                                                    simType === sc.id
                                                        ? "border-accent bg-accent/5 text-foreground shadow-lg shadow-accent/5"
                                                        : "border-border bg-zinc-950/60 text-muted-foreground hover:border-border/60 hover:text-foreground",
                                                )}
                                            >
                                                <h4 className="text-xs font-extrabold uppercase tracking-wide">
                                                    {sc.title}
                                                </h4>
                                                <p className="text-[10px] text-muted-foreground mt-1 leading-normal font-medium">
                                                    {sc.desc}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={() => runSimulation(simType)}
                                    disabled={isSimulating}
                                    variant="accent"
                                    className="w-full h-11 rounded-lg flex items-center justify-center gap-2 font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-accent/15"
                                >
                                    {isSimulating ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />{" "}
                                            Simulating...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 fill-current" />{" "}
                                            Trigger Simulation
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Core State Architecture Map Visualizer */}
                            <div className="lg:col-span-8 flex flex-col gap-6">
                                <div className="flex-1 rounded-2xl border border-border bg-muted/20 p-6 flex flex-col justify-between min-h-[360px]">
                                    <div className="flex items-center justify-between pb-4 border-b border-border">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                            Cluster Architecture State
                                        </h3>
                                        <span className="text-[9px] font-mono text-muted-foreground">
                                            Live Coordination Graph
                                        </span>
                                    </div>

                                    {/* Visual Map Layout */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 items-center relative text-left">
                                        {/* Gateway Column */}
                                        <div
                                            className={cn(
                                                "p-4 rounded-xl border transition-all text-center space-y-2",
                                                gatewayState === "processing"
                                                    ? "border-amber-500 bg-amber-500/5 text-amber-500 shadow-lg shadow-amber-500/5"
                                                    : gatewayState === "error"
                                                      ? "border-rose-500 bg-rose-500/5 text-rose-500"
                                                      : "border-border bg-muted/40 text-muted-foreground",
                                            )}
                                        >
                                            <Server className="w-5 h-5 mx-auto" />
                                            <h4 className="text-[10px] font-extrabold uppercase tracking-widest">
                                                Gateway API
                                            </h4>
                                            <span className="text-[9px] font-mono bg-muted py-0.5 px-2 rounded-full border border-border/60">
                                                {gatewayState === "processing"
                                                    ? "INGESTING"
                                                    : gatewayState === "error"
                                                      ? "BLOCKED (409)"
                                                      : "LISTENING"}
                                            </span>
                                        </div>

                                        {/* Redis Stream Queue */}
                                        <div
                                            className={cn(
                                                "p-4 rounded-xl border transition-all text-center space-y-2",
                                                streamQueue.length > 0
                                                    ? "border-blue-500 bg-blue-500/5 text-blue-500 shadow-lg shadow-blue-500/5"
                                                    : "border-border bg-muted/40 text-muted-foreground",
                                            )}
                                        >
                                            <GitBranch className="w-5 h-5 mx-auto" />
                                            <h4 className="text-[10px] font-extrabold uppercase tracking-widest">
                                                Redis Stream
                                            </h4>
                                            <span className="text-[9px] font-mono bg-muted py-0.5 px-2 rounded-full border border-border/60">
                                                {streamQueue.length > 0
                                                    ? "ENTRIES: 1"
                                                    : "EMPTY"}
                                            </span>
                                        </div>

                                        {/* Workers Pool Column */}
                                        <div className="flex flex-col gap-3">
                                            {/* Worker A */}
                                            <div
                                                className={cn(
                                                    "p-3 rounded-xl border transition-all text-center relative",
                                                    activeWorker ===
                                                        "Worker-A" &&
                                                        workerAStatus ===
                                                            "Success"
                                                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-500"
                                                        : activeWorker ===
                                                                "Worker-A" &&
                                                            workerAStatus ===
                                                                "Crashed"
                                                          ? "border-rose-500 bg-rose-500/5 text-rose-500 animate-pulse"
                                                          : activeWorker ===
                                                              "Worker-A"
                                                            ? "border-purple-500 bg-purple-500/5 text-purple-500"
                                                            : "border-border bg-muted/40 text-muted-foreground",
                                                )}
                                            >
                                                <h4 className="text-[10px] font-extrabold uppercase">
                                                    Worker A
                                                </h4>
                                                <span className="text-[8px] font-mono block mt-1">
                                                    STATUS: {workerAStatus}
                                                </span>
                                            </div>
                                            {/* Worker B */}
                                            <div
                                                className={cn(
                                                    "p-3 rounded-xl border transition-all text-center relative",
                                                    activeWorker ===
                                                        "Worker-B" &&
                                                        workerBStatus ===
                                                            "Success"
                                                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-500"
                                                        : activeWorker ===
                                                            "Worker-B"
                                                          ? "border-purple-500 bg-purple-500/5 text-purple-500"
                                                          : "border-border bg-muted/40 text-muted-foreground",
                                                )}
                                            >
                                                <h4 className="text-[10px] font-extrabold uppercase">
                                                    Worker B
                                                </h4>
                                                <span className="text-[8px] font-mono block mt-1">
                                                    STATUS: {workerBStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Shared Persistence & Memory Middleware */}
                                        <div className="flex flex-col gap-2.5">
                                            {/* Redis Idempotency Lock */}
                                            <div
                                                className={cn(
                                                    "p-2 rounded-xl border transition-all text-center",
                                                    redisLock !== "Empty"
                                                        ? "border-cyan-500 bg-cyan-500/5 text-cyan-400"
                                                        : "border-border bg-muted/40 text-muted-foreground",
                                                )}
                                            >
                                                <Lock className="w-4 h-4 mx-auto mb-1 text-cyan-500" />
                                                <span className="text-[8px] font-mono block">
                                                    {redisLock === "Empty"
                                                        ? "LOCKS: NONE"
                                                        : redisLock}
                                                </span>
                                            </div>
                                            {/* PostgreSQL State Manager */}
                                            <div
                                                className={cn(
                                                    "p-2 rounded-xl border transition-all text-center",
                                                    dbState !== "Empty"
                                                        ? "border-orange-500 bg-orange-500/5 text-orange-400"
                                                        : "border-border bg-muted/40 text-muted-foreground",
                                                )}
                                            >
                                                <Database className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                                                <span className="text-[8px] font-mono block">
                                                    {dbState === "Empty"
                                                        ? "DB STATE: NONE"
                                                        : dbState}
                                                </span>
                                            </div>
                                            {/* Dead Letter Queue */}
                                            <div
                                                className={cn(
                                                    "p-2 rounded-xl border transition-all text-center",
                                                    dlqState !== "Empty"
                                                        ? "border-rose-500 bg-rose-500/5 text-rose-400 animate-pulse"
                                                        : "border-border bg-muted/40 text-muted-foreground",
                                                )}
                                            >
                                                <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-rose-500" />
                                                <span className="text-[8px] font-mono block">
                                                    {dlqState === "Empty"
                                                        ? "DLQ: EMPTY"
                                                        : "DLQ: ACTIVE JOB"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Terminal-like log simulator */}
                                    <div className="rounded-xl border border-border bg-background p-4 h-[160px] flex flex-col justify-between">
                                        <div className="flex items-center justify-between pb-2 border-b border-border text-muted-foreground font-mono text-[9px]">
                                            <div className="flex items-center gap-1.5">
                                                <Terminal className="w-3.5 h-3.5" />
                                                <span>
                                                    Loki Log Stream &
                                                    OpenTelemetry Spans
                                                </span>
                                            </div>
                                            <span>
                                                Trace ID:{" "}
                                                {isSimulating
                                                    ? "tr_8f12a80c9..."
                                                    : "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto font-mono text-[10px] text-muted-foreground py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
                                            {simLogs.length === 0 ? (
                                                <div className="text-muted-foreground text-center h-full flex items-center justify-center">
                                                    Click "Trigger Simulation"
                                                    to spin up the async
                                                    execution trace.
                                                </div>
                                            ) : (
                                                simLogs.map((log, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="whitespace-pre-wrap leading-relaxed"
                                                    >
                                                        {log}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* RELIABILITY & SYSTEM GUARANTEES */}
                <section
                    id="reliability-guarantees"
                    className="border-t border-border bg-muted/10 py-20 text-left"
                >
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="max-w-3xl space-y-4 mb-16">
                            <Badge
                                variant="outline"
                                className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-accent/25 text-accent bg-accent/5"
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

                {/* UNDER THE HOOD: ARCHITECTURE MAP */}
                <section
                    id="under-the-hood"
                    className="border-t border-border bg-muted/20 py-20"
                >
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <div className="max-w-3xl space-y-4 mb-16 text-left mx-auto md:text-center">
                            <Badge
                                variant="outline"
                                className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-accent/25 text-accent bg-accent/5"
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
                                <div className="rounded-[2rem] border border-border bg-card/30 backdrop-blur-sm p-6 md:p-8 space-y-6 hover:border-accent/30 hover:-translate-y-1 transition-all duration-500 relative group overflow-hidden flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none group-hover:bg-accent/10 transition-colors"></div>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between pb-3 border-b border-border/50">
                                            <span className="text-[10px] text-accent uppercase tracking-[0.2em]">01. Ingestion</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-[11px] text-foreground uppercase tracking-wide mb-2">Ingress Clients</h4>
                                                <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                                                    <div className="py-2.5 px-3 bg-zinc-950/60 border border-border/40 rounded-xl text-muted-foreground">Web App</div>
                                                    <div className="py-2.5 px-3 bg-zinc-950/60 border border-border/40 rounded-xl text-muted-foreground">API / CLI</div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-[11px] text-foreground uppercase tracking-wide">Gateway Stack</h4>
                                                <div className="p-3.5 bg-zinc-950/80 border border-border/60 rounded-2xl space-y-2">
                                                    <div>
                                                        <h5 className="text-[10px] text-foreground">Traefik Proxy</h5>
                                                        <span className="text-[9px] text-muted-foreground font-medium block mt-0.5">Edge routing & path mapping</span>
                                                    </div>
                                                    <div className="h-px bg-border/40" />
                                                    <div>
                                                        <h5 className="text-[10px] text-foreground">FastAPI Gateway</h5>
                                                        <span className="text-[9px] text-muted-foreground font-medium block mt-0.5">Ingestion, auth & validation</span>
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
                                            <span className="text-[10px] text-blue-400 uppercase tracking-[0.2em]">02. Transport</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-[11px] text-foreground uppercase tracking-wide mb-2">Message Queue</h4>
                                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                                                    Redis Streams acts as an immutable journal, absorbing spikes in traffic and decoupling ingest rate from database updates.
                                                </p>
                                            </div>
                                            <div className="p-4 bg-zinc-950/80 border border-border/60 rounded-2xl space-y-3">
                                                <span className="text-[9px] text-blue-400 uppercase tracking-widest block text-center">Active Streams</span>
                                                <div className="space-y-2 text-[9px]">
                                                    <div className="p-2 bg-muted/60 border border-border/40 rounded-xl flex items-center gap-2">
                                                        <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                                                        <span>stream:social-post</span>
                                                    </div>
                                                    <div className="p-2 bg-muted/60 border border-border/40 rounded-xl flex items-center gap-2">
                                                        <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                                                        <span>stream:social-publish</span>
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
                                            <span className="text-[10px] text-purple-400 uppercase tracking-[0.2em]">03. Workers</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { service: "identity-service", desc: "Auth, users & tokens", db: "identity-db" },
                                                { service: "social-post-service", desc: "Post content metadata", db: "social-post-db" },
                                                { service: "social-account-service", desc: "Account integrations", db: "social-account-db" },
                                                { service: "social-publish-service", desc: "Step execution & dispatch", db: "social-publish-db" },
                                            ].map((srv, idx) => (
                                                <div key={idx} className="p-2.5 rounded-xl border border-border bg-zinc-950/60 flex items-center justify-between gap-3 hover:border-purple-500/20 transition-all duration-300">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[8px] text-muted-foreground uppercase tracking-widest block">Domain {idx + 1}</span>
                                                        <span className="text-[10px] text-purple-400">{srv.service}</span>
                                                        <span className="text-[8px] text-muted-foreground font-medium block">{srv.desc}</span>
                                                    </div>
                                                    <div className="px-2 py-1 bg-muted border border-border/40 rounded-lg text-orange-400 text-[8.5px] flex items-center gap-1 shrink-0">
                                                        <Database className="w-3 h-3" />
                                                        <span>{srv.db.replace("-db", "")}</span>
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

                {/* ENGINEERING DEEP DIVE */}
                <section
                    id="engineering-deep-dive"
                    className="max-w-7xl mx-auto px-6 py-20 text-left"
                >
                    <div className="space-y-12">
                        <div className="space-y-4 max-w-3xl">
                            <Badge
                                variant="outline"
                                className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-accent/25 text-accent bg-accent/5"
                            >
                                Engineering Deep Dive
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                                Technical trade-offs & execution choices
                            </h2>
                            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                                Review our engineering justifications and
                                coordination choices compared to traditional
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
                                                ? "border-accent bg-accent/5 text-accent"
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
                                                {tab.bullets.map(
                                                    (bullet, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-start gap-3 text-xs text-foreground"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0"></div>
                                                            <p className="leading-relaxed font-medium">
                                                                {bullet}
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
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

                {/* TECH STACK SECTION */}
                <section className="border-t border-border bg-muted/10 py-20 text-left">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="max-w-3xl space-y-4 mb-16">
                            <Badge
                                variant="outline"
                                className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-accent/25 text-accent bg-accent/5"
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

                {/* PRICING & FAQ SECTION */}
                <section
                    id="pricing-roadmap"
                    className="border-t border-border bg-[#070708] py-20 text-left"
                >
                    <div className="max-w-7xl mx-auto px-6 space-y-20">
                        {/* Section Header */}
                        <div className="max-w-3xl space-y-4">
                            <Badge
                                variant="outline"
                                className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-border/60 text-accent bg-card"
                            >
                                Pricing & Plans
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                                Transparent plans for any scale
                            </h2>
                            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                                Choose our managed cloud service for a
                                hassle-free deployment, or host the open-source
                                core codebase on your own infrastructure.
                            </p>
                        </div>

                        {/* Pricing Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Starter Plan */}
                            <div className="rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md p-8 flex flex-col justify-between hover:border-accent/20 transition-all duration-500 hover:shadow-lg relative group">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                                            Starter
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-baseline text-foreground">
                                            <span className="text-4xl md:text-5xl font-black tracking-tighter">
                                                $0
                                            </span>
                                            <span className="text-xs text-muted-foreground font-bold italic opacity-40 ml-1">
                                                /month
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                            Perfect for exploring the platform
                                            and personal use.
                                        </p>
                                    </div>

                                    <div className="h-px bg-border/40 w-full" />

                                    <ul className="space-y-4">
                                        {[
                                            "3 Social Profiles",
                                            "10 Posts / Month",
                                            "Basic Analytics",
                                            "Standard Support",
                                        ].map((feat, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-3 text-xs text-foreground/80 font-medium"
                                            >
                                                <div className="p-0.5 rounded-full bg-accent/10 text-accent mt-0.5 shadow-inner">
                                                    <Check className="w-3 h-3 stroke-[3px]" />
                                                </div>
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="pt-8">
                                    <Link to="/register">
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
                                        >
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Pro Plan (Featured) */}
                            <div className="rounded-[2.5rem] border border-accent bg-accent/[0.02] backdrop-blur-md p-8 flex flex-col justify-between shadow-xl shadow-accent/[0.03] hover:shadow-accent/[0.08] transition-all duration-500 hover:-translate-y-1 relative group ring-1 ring-accent">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-700"></div>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                                            Pro Plan
                                        </span>
                                        <Badge
                                            variant="success"
                                            className="bg-accent/10 text-accent border-accent/20 font-black text-[9px] uppercase tracking-widest rounded-full px-2.5 py-0.5"
                                        >
                                            <Star className="w-2.5 h-2.5 mr-1 fill-accent text-accent" />{" "}
                                            Popular
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-baseline text-foreground">
                                            <span className="text-4xl md:text-5xl font-black tracking-tighter">
                                                $29
                                            </span>
                                            <span className="text-xs text-accent font-bold italic opacity-60 ml-1">
                                                /month
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                            Ideal for growing businesses and
                                            social media managers.
                                        </p>
                                    </div>

                                    <div className="h-px bg-accent/20 w-full" />

                                    <ul className="space-y-4">
                                        {[
                                            "10 Social Profiles",
                                            "Unlimited Posts",
                                            "Advanced Analytics",
                                            "Priority Support",
                                            "Team Collaboration",
                                        ].map((feat, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-3 text-xs text-foreground font-semibold"
                                            >
                                                <div className="p-0.5 rounded-full bg-accent text-accent-foreground mt-0.5 shadow-md shadow-accent/20">
                                                    <Check className="w-3 h-3 stroke-[3px]" />
                                                </div>
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="pt-8 relative z-10">
                                    <Link to="/register">
                                        <Button
                                            variant="accent"
                                            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-lg shadow-accent/15"
                                        >
                                            Start Free Trial
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md p-8 flex flex-col justify-between hover:border-accent/20 transition-all duration-500 hover:shadow-lg relative group">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                                            Enterprise
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-baseline text-foreground">
                                            <span className="text-4xl md:text-5xl font-black tracking-tighter">
                                                $99
                                            </span>
                                            <span className="text-xs text-muted-foreground font-bold italic opacity-40 ml-1">
                                                /month
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                            Complete solution for large agencies
                                            and corporations.
                                        </p>
                                    </div>

                                    <div className="h-px bg-border/40 w-full" />

                                    <ul className="space-y-4">
                                        {[
                                            "Unlimited everything",
                                            "Custom Reporting",
                                            "Dedicated Manager",
                                            "API Access",
                                            "SSO integration",
                                        ].map((feat, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-3 text-xs text-foreground/80 font-medium"
                                            >
                                                <div className="p-0.5 rounded-full bg-accent/10 text-accent mt-0.5 shadow-inner">
                                                    <Check className="w-3 h-3 stroke-[3px]" />
                                                </div>
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="pt-8">
                                    <Link to="/register">
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
                                        >
                                            Contact Sales
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="pt-8 border-t border-border/40 space-y-12">
                            <div className="space-y-3">
                                <Badge
                                    variant="outline"
                                    className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-accent/25 text-accent bg-accent/5"
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
                                        className="p-6 rounded-2xl border border-border/40 bg-card/25 hover:border-accent/15 transition-all duration-300 space-y-2"
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

                {/* FINAL CTA SECTION */}
                <section className="max-w-7xl mx-auto px-6 py-20">
                    <div className="relative rounded-[2.5rem] border border-border bg-card/45 backdrop-blur-md overflow-hidden p-12 md:p-20 text-center space-y-8 shadow-2xl hover:border-accent/20 transition-all duration-700 group">
                        {/* Glow details */}
                        <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-accent/10 transition-all duration-700"></div>
                        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-accent/10 transition-all duration-700"></div>

                        <div className="space-y-4 relative z-10 max-w-3xl mx-auto">
                            <Badge
                                variant="outline"
                                className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-accent/25 text-accent bg-accent/5"
                            >
                                Deployment
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
                                Launch the cluster in your environment
                            </h2>
                            <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
                                Run the complete microservices stack locally
                                with docker compose. Telemetry, Postgres tables,
                                and worker processes initialize automatically.
                            </p>
                        </div>

                        {/* Interactive terminal command copy block */}
                        <div
                            onClick={handleCopy}
                            className="max-w-md mx-auto p-4 rounded-xl bg-zinc-950/60 hover:bg-zinc-950 text-foreground border border-border/60 hover:border-accent/30 font-mono text-xs flex items-center justify-between shadow-2xl relative z-10 cursor-pointer transition-all duration-300 group/term"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="text-accent font-bold">$</span>
                                <span className="text-muted-foreground group-hover/term:text-foreground transition-colors select-all">
                                    docker compose up --build -d
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2.5 rounded-md text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 hover:bg-background/80"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-accent" />
                                        <span className="text-accent">
                                            Copied
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover/term:text-foreground transition-colors" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-4">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="accent"
                                    className="w-full sm:w-auto rounded-lg h-12 px-8 text-xs font-black uppercase tracking-widest gap-2 shadow-lg shadow-accent/15"
                                >
                                    Launch Console{" "}
                                    <ChevronRight className="w-4 h-4 stroke-[3px]" />
                                </Button>
                            </Link>
                            <a
                                href="https://github.com/zerexei/posexei"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto"
                            >
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto rounded-lg h-12 px-8 text-xs font-black uppercase tracking-widest gap-2 hover:bg-muted"
                                >
                                    <GithubIcon /> GitHub Repository
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-border bg-muted/40 py-16 text-left">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <AppLogo />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium max-w-xs leading-relaxed">
                            A production-grade distributed publishing system
                            built to study coordination primitives and
                            failure-safe architectures.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                            System Nodes
                        </h3>
                        <ul className="space-y-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <li>
                                <a
                                    href="#under-the-hood"
                                    className="hover:text-foreground transition-colors"
                                >
                                    FastAPI Gateway
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#under-the-hood"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Redis Streams Broker
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#under-the-hood"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Social publish worker
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#under-the-hood"
                                    className="hover:text-foreground transition-colors"
                                >
                                    PostgreSQL Persistence
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                            Engineering Resources
                        </h3>
                        <ul className="space-y-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <li>
                                <a
                                    href="https://github.com/zerexei/posexei"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                >
                                    GitHub Repository
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#engineering-deep-dive"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Technical tradeoffs
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#reliability-guarantees"
                                    className="hover:text-foreground transition-colors"
                                >
                                    System guarantees
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#interactive-simulator"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Chaos Simulator
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[9px] text-muted-foreground">
                    <p>
                        © 2026 AD. Publish. All rights reserved. Codebase
                        licensed under the MIT License.
                    </p>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://github.com/zerexei/posexei"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="#pricing-roadmap"
                            className="hover:text-foreground transition-colors"
                        >
                            Developer FAQ
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;
