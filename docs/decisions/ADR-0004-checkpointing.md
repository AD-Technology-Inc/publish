# ADR-0004: Microservice Step Checkpointing via StateManager

## Purpose
Documenting the decision to enforce step-level progress persistence across multi-stage worker execution pipelines.

## Context
Multi-step job execution (e.g. payload validation $\rightarrow$ DB record creation $\rightarrow$ event dispatch $\rightarrow$ platform publish) can crash mid-pipeline. Restarting execution from Step 1 duplicates database records and wastes network bandwidth.

## Decision
Implement `StateManager` in `services/shared/shared/utils.py` to persist milestone step progress (`started`, `db_stored`, `token_retrieved`, `completed`) to PostgreSQL table `job_execution_state`, with transparent fallback to Redis key `job_state:{job_id}`.

## Alternatives Considered
- **Stateless Re-Execution**: Re-execute the entire pipeline from scratch on retry. (Rejected due to duplicate database entries and API rate limit waste).
- **Saga Pattern Orchestration**: Heavy orchestrator managing saga state graphs. (Rejected as overly complex for 3-step publishing pipelines).

## Consequences
- Retried jobs inspect `get_last_step(job_id)` and immediately skip previously completed milestones.
- PostgreSQL schema enforces atomic step updates via `ON CONFLICT (job_id) DO UPDATE`.

## Tradeoffs
- Introduces synchronous PostgreSQL write calls to the worker execution path.
