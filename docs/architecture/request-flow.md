# Request Flow & Execution Pathways

## Purpose
This document provides a detailed trace of synchronous HTTP ingestion and asynchronous background job execution pathways across the **AD. Publish** platform.

---

## 1. Synchronous HTTP Ingestion Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Traefik
    participant Gateway
    participant ResilientClient
    participant ServiceAPI
    participant RedisStream

    Client->>Traefik: POST http://gateway.localhost/social/posts
    Traefik->>Gateway: Forward HTTP Request
    Gateway->>ResilientClient: forward("social-post-service", "POST", url, request)
    
    rect rgb(240, 240, 255)
        Note over ResilientClient: Check Circuit Breaker (FailureStore in Redis)
        alt Circuit OPEN
            ResilientClient-->>Gateway: HTTP 503 (Circuit Open)
            Gateway-->>Client: HTTP 503 Service Unavailable
        else Circuit CLOSED
            ResilientClient->>ServiceAPI: HTTP POST http://social-post-service:3001/posts
        end
    end

    rect rgb(240, 255, 240)
        Note over ServiceAPI: Check Backpressure: XLEN jobs:social-post
        alt XLEN > 10000
            ServiceAPI-->>Gateway: HTTP 429 Queue overload
            Gateway-->>Client: HTTP 429 Too Many Requests
        else Queue Capacity OK
            ServiceAPI->>RedisStream: XADD jobs:social-post {payload, status:"pending"}
            ServiceAPI->>RedisStream: SET job_state:{job_id} "pending" ex=86400
            ServiceAPI-->>Gateway: HTTP 200 {"status":"enqueued", "job_id":"..."}
            Gateway-->>Client: HTTP 200 {"status":"enqueued", "job_id":"..."}
        end
    end
```

---

## 2. Asynchronous Worker Execution & State Checkpointing Flow

```mermaid
sequenceDiagram
    autonumber
    participant RedisStream as Redis Stream
    participant Worker as Worker Loop
    participant Heartbeat as Heartbeat Thread
    participant Idempotency as IdempotencyStore (Redis)
    participant StateMgr as StateManager (Postgres/Redis)
    participant ExternalAPI as Platform API (Facebook/LinkedIn)

    Worker->>RedisStream: XREADGROUP group="workers" consumer="worker-1" count=1 block=5000
    RedisStream-->>Worker: Return message (message_id, payload)
    
    Worker->>Heartbeat: Add message_id to active_jobs
    loop Every 30 seconds
        Heartbeat->>RedisStream: SET job_lease:{message_id} "1" ex=120
    end

    Worker->>Idempotency: SET idempotency:{key} "1" NX EX 86400
    alt Idempotency Key Exists (Duplicate Job)
        Idempotency-->>Worker: False (Key Exists)
        Worker->>Worker: Log duplicate skip & return
        Worker->>RedisStream: XACK & XDEL message_id
    else Idempotency Claimed
        Idempotency-->>Worker: True (Set Success)
        
        Worker->>StateMgr: get_last_step(job_id)
        StateMgr-->>Worker: return last_step (e.g. "started")

        alt last_step == "started"
            Worker->>StateMgr: save_step(job_id, "token_retrieved")
            Note over Worker: Execute business logic (e.g., fetch token)
        end

        Worker->>ExternalAPI: Call Adapter.publish(page_id, message, token)
        
        alt API Call Succeeded
            ExternalAPI-->>Worker: Return platform_post_id
            Worker->>StateMgr: save_step(job_id, "completed")
            Worker->>RedisStream: SET job_state:{job_id} "completed"
            Worker->>RedisStream: SET job_result:{job_id} post_id
            Worker->>Heartbeat: Remove message_id from active_jobs
            Worker->>RedisStream: DEL job_lease:{message_id}
            Worker->>RedisStream: XACK & XDEL message_id
        else API Returned Transient 5xx
            ExternalAPI-->>Worker: 500 Internal Error / Timeout
            Worker->>Worker: Calculate backoff = base * 5^(attempt-1)
            Worker->>RedisStream: ZADD jobs:service:delayed execute_at payload
            Worker->>RedisStream: XACK & XDEL message_id
        else API Returned Non-Retryable 4xx
            ExternalAPI-->>Worker: 400 Bad Request / 401 Unauthorized
            Worker->>RedisStream: XADD jobs:service:dlq {payload, error, retry_count}
            Worker->>RedisStream: XACK & XDEL message_id
        end
    end
```

---

## Step-by-Step Code Path Reference

1. **Client Request Submission**:
   - `gateway/app/routes/v1/social_posts.py`: `create_social_post()` invokes `_forward("POST", "http://social-post-service:3001/posts", json=request.model_dump())`.
   - `gateway/app/http_client.py`: `forward()` creates a `FailureStore` key in Redis, executes `ResilientHttpClient.request()`, checks sliding window failures, and proxies HTTP call.

2. **Job Enqueueing & Backpressure**:
   - `services/social-post-service/main.py`: `create_post()` executes `redis_client.xlen("jobs:social-post")`. If `> 10000`, returns HTTP 429. Otherwise calls `RedisQueue.enqueue()` (`XADD jobs:social-post`) and initializes `job_state:{job_id}` to `"pending"`.

3. **Worker Stream Consumption**:
   - `services/shared/shared/worker.py`: `Worker.run()` starts background daemon thread `_heartbeat_loop()`. Main thread enters infinite loop executing `RedisQueue.read_jobs()` (`XREADGROUP group="workers" consumer="hostname"`).

4. **Lease Maintenance**:
   - `Worker._heartbeat_loop()` iterates active job message IDs every 30s, calling `redis.set(f"job_lease:{message_id}", "1", ex=120)`.

5. **Step Execution & Checkpointing**:
   - `services/social-publish-service/worker.py`: `handle_publish_post()` queries `StateManager.get_last_step(job_id)`. If step is incomplete, retrieves platform access token, saves milestone `token_retrieved`, and executes selected `SocialPlatformAdapter.publish()`.

6. **State Completion & Teardown**:
   - Worker writes `job_state:{job_id}` = `"completed"`, writes `job_result:{job_id}` = `post_id`, removes job from `self.active_jobs`, deletes `job_lease:{message_id}`, and issues `XACK` + `XDEL` to Redis Stream.
