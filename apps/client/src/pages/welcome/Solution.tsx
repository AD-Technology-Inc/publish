import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/core";

export const Solution: React.FC = () => {
    return (
        <section className="border-t border-border bg-muted/10 py-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-5 space-y-6 text-left">
                        <Badge
                            variant="outline"
                            className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-primary/25 text-primary bg-primary/5"
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
    );
};
