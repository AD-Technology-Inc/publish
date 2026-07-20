# ADR-0002: Selection of Redis Streams for Job Transport

## Context
Asynchronous jobs (user creation, account linking, social post publishing) require a durable, low-latency messaging broker capable of supporting partitioned consumer groups, unacknowledged message tracking, and dead-letter routing.

## Problem
Heavyweight message brokers like Apache Kafka or RabbitMQ require multi-node cluster management, Zookeeper/KRaft coordination, and significant memory resource allocations that complicate local container deployments and operational maintenance.

## Decision
Use **Redis Streams** (`XADD`, `XREADGROUP`, `XACK`, `XDEL`) as the primary distributed transport broker across all microservice boundaries.

## Alternatives Considered
- **Apache Kafka**: High throughput and log compaction, but operational complexity and memory footprint (>1GB) exceed requirements for lightweight job queues.
- **RabbitMQ (AMQP)**: Feature-rich queuing, but lacks native log-offset consumer group mechanisms as cleanly integrated into a existing Redis key-value stack.
- **Celery / Redis KV**: Popular Python task queue, but hides lower-level PEL tracking, `XAUTOCLAIM` recovery control, and stream capping mechanics.

## Consequences
- Redis Streams provide sub-millisecond enqueue and dequeue performance.
- Consumer groups (`workers`) partition workload across dynamic worker instances.
- Reuses existing Redis infrastructure already deployed for key-value locks and rate limiters.

## Tradeoffs
- Redis is an in-memory data store; durability depends on AOF/RDB configuration and bounded stream caps (`maxlen=10000`).
