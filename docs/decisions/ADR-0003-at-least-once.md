# ADR-0003: At-Least-Once Delivery Semantics

## Context
Publishing operations interact with third-party social media network APIs across un-trusted distributed networks subject to node crashes, network partitions, and socket dropouts.

## Problem
Attempting to achieve exactly-once delivery over distributed networks requires complex multi-phase commit (2PC) or distributed consensus protocols that degrade system availability and fail under network partitions (CAP theorem constraint).

## Decision
Adopt **At-Least-Once Delivery** semantics paired with mandatory application-level idempotency locks (`IdempotencyMiddleware`) and milestone checkpointing (`StateManager`).

## Alternatives Considered
- **Exactly-Once Delivery via Distributed Transactions**: Prohibitively complex, slow, and fragile under third-party API availability failures.
- **At-Most-Once Delivery**: Simple, but drops unacknowledged messages during worker crashes, leading to lost jobs and user data corruption.

## Consequences
- Guaranteed message durability: jobs persist in Redis Stream PELs until explicitly acknowledged (`XACK`).
- Worker node crashes trigger automatic re-delivery via `XAUTOCLAIM`.

## Tradeoffs
- Demands that all worker job handlers implement atomic idempotency checks (`SET NX`) to safely filter duplicate deliveries.
