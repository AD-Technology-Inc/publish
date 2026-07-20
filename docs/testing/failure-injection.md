# Failure Injection API & Configuration

## Purpose
This document details the source code implementation and invocation parameters of `FailureSimulator` in `services/shared/shared/utils.py`.

---

## Source Implementation Reference (`services/shared/shared/utils.py`)

```python
class FailureSimulator:
    """Utility to inject failures in development"""
    
    @staticmethod
    def simulate_failure(chance: float = 0.3):
        """Randomly raise errors or sleep based on chance"""
        roll = random.random()
        if roll > chance:
            return
            
        # Determine type of failure
        failure_type = random.choice(["latency", "retryable", "non_retryable"])
        
        if failure_type == "latency":
            sleep_time = random.uniform(1.0, 5.0)
            logger.info(f"[SIMULATOR] Injecting latency: {sleep_time:.2f}s")
            time.sleep(sleep_time)
        elif failure_type == "retryable":
            logger.info("[SIMULATOR] Injecting retryable 500 error")
            raise Exception("Simulated 5xx internal server error")
        elif failure_type == "non_retryable":
            logger.info("[SIMULATOR] Injecting non-retryable validation error")
            raise NonRetryableError("Simulated Validation Error (400)")
```

---

## Invocations in Worker Handlers

To inject chaos into a worker, call `FailureSimulator.simulate_failure(chance)` at the entry point of the handler:

```python
def handle_create_user(payload: dict):
    FailureSimulator.simulate_failure(chance=0.2)  # 20% chance of fault injection
    # ... business logic ...
```
