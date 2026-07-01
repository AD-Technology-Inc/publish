import * as React from "react";
import {
    Play,
    RefreshCw,
    Server,
    GitBranch,
    Lock,
    Database,
    AlertTriangle,
    Terminal,
} from "lucide-react";
import { Button, Badge } from "@/components/ui/core";
import { cn } from "@/lib/utils";

export const InteractiveSimulator: React.FC = () => {
    // Simulation states
    const [simType, setSimType] = React.useState<
        "normal" | "crash" | "duplicate" | "ratelimit"
    >("normal");
    const [simLogs, setSimLogs] = React.useState<string[]>([]);
    const [isSimulating, setIsSimulating] = React.useState<boolean>(false);

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
        <section
            id="interactive-simulator"
            className="max-w-7xl mx-auto px-6 py-20"
        >
            <div className="space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <Badge
                        variant="outline"
                        className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-primary/25 text-primary bg-primary/5"
                    >
                        Simulation Sandbox
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                        Test system resilience in real-time
                    </h2>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                        Inject failures, trigger duplicate requests, or exhaust rate limits to
                        watch AD. Publish's coordination state machine recover step checkpoints.
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
                                            !isSimulating && setSimType(sc.id as "normal" | "crash" | "duplicate" | "ratelimit")
                                        }
                                        disabled={isSimulating}
                                        className={cn(
                                            "p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden disabled:opacity-60",
                                            simType === sc.id
                                                ? "border-primary bg-primary/5 text-foreground shadow-lg shadow-primary/5"
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
                            className="w-full h-11 rounded-lg flex items-center justify-center gap-2 font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-primary/15"
                        >
                            {isSimulating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" /> Simulating...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 fill-current" /> Trigger Simulation
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
                                        {streamQueue.length > 0 ? "ENTRIES: 1" : "EMPTY"}
                                    </span>
                                </div>

                                {/* Workers Pool Column */}
                                <div className="flex flex-col gap-3">
                                    {/* Worker A */}
                                    <div
                                        className={cn(
                                            "p-3 rounded-xl border transition-all text-center relative",
                                            activeWorker === "Worker-A" &&
                                                workerAStatus === "Success"
                                                ? "border-emerald-500 bg-emerald-500/5 text-emerald-500"
                                                : activeWorker === "Worker-A" &&
                                                    workerAStatus === "Crashed"
                                                  ? "border-rose-500 bg-rose-500/5 text-rose-500 animate-pulse"
                                                  : activeWorker === "Worker-A"
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
                                            activeWorker === "Worker-B" &&
                                                workerBStatus === "Success"
                                                ? "border-emerald-500 bg-emerald-500/5 text-emerald-500"
                                                : activeWorker === "Worker-B"
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
                                            {redisLock === "Empty" ? "LOCKS: NONE" : redisLock}
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
                                            {dbState === "Empty" ? "DB STATE: NONE" : dbState}
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
                                            {dlqState === "Empty" ? "DLQ: EMPTY" : "DLQ: ACTIVE JOB"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Terminal-like log simulator */}
                            <div className="rounded-xl border border-border bg-background p-4 h-[160px] flex flex-col justify-between">
                                <div className="flex items-center justify-between pb-2 border-b border-border text-muted-foreground font-mono text-[9px]">
                                    <div className="flex items-center gap-1.5">
                                        <Terminal className="w-3.5 h-3.5" />
                                        <span>Loki Log Stream & OpenTelemetry Spans</span>
                                    </div>
                                    <span>Trace ID: {isSimulating ? "tr_8f12a80c9..." : "N/A"}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto font-mono text-[10px] text-muted-foreground py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
                                    {simLogs.length === 0 ? (
                                        <div className="text-muted-foreground text-center h-full flex items-center justify-center">
                                            Click "Trigger Simulation" to spin up the async execution
                                            trace.
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
    );
};
