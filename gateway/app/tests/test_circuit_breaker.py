from unittest.mock import AsyncMock, patch

import httpx
import pytest
import redis.asyncio as redis
from resilient_http_client import (
    FailureStore,
    ResilienceConfig,
    ResilientHttpClient,
)
from resilient_http_client.types import CircuitState


@pytest.fixture
async def redis_client():
    client = redis.Redis(host="localhost", port=6379, decode_responses=True)
    # Ping to check connection
    await client.ping()
    yield client
    # Clean up test keys
    keys = await client.keys("resilience:test-service:*")
    for key in keys:
        await client.delete(key)
    await client.aclose()


@pytest.mark.asyncio
async def test_circuit_breaker_sliding_window(redis_client):
    service_name = "test-service"
    store = FailureStore(redis=redis_client, service=service_name)

    # Initialize resilience config matching user requirement
    config = ResilienceConfig(
        cooldown=10,
        max_retries=1,  # 1 retry (max 2 attempts per call)
        timeout=5.0,
        half_open_max_calls=3,
        half_open_successes_needed=2,
        sliding_window_type="TIME_BASED",
        sliding_window_size=10,
        minimum_number_of_calls=5,
        failure_rate_threshold=50.0,
        retry_status_codes={408, 429, 500, 503},
        circuit_failure_status_codes={500, 503},
    )

    # Reset the state to CLOSED first
    await store.set_state(CircuitState.CLOSED.value)
    await store.reset_failures()
    await store.reset_half_open()
    await store.reset_window()

    # We want to test time-based sliding window:
    # 1. Successful requests do not trip the circuit.
    # 2. Minimum number of calls (5) must be reached.
    # 3. 50% failure rate will trip it.

    responses = [
        httpx.Response(200, json={"status": "ok"}),  # Call 1: Success
        httpx.Response(200, json={"status": "ok"}),  # Call 2: Success
        httpx.Response(
            500, json={"error": "server error"}
        ),  # Call 3: Attempt 1 Failure
        httpx.Response(
            500, json={"error": "server error"}
        ),  # Call 3: Attempt 2 (Retry) Failure -> Returns 500
        httpx.Response(
            500, json={"error": "server error"}
        ),  # Call 4: Attempt 1 Failure
        httpx.Response(
            500, json={"error": "server error"}
        ),  # Call 4: Attempt 2 (Retry) Failure -> Returns 500
    ]

    response_iter = iter(responses)

    async def mock_send(method, url, **kwargs):
        try:
            return next(response_iter)
        except StopIteration:
            return httpx.Response(200, json={"status": "unexpected call"})

    with (
        patch(
            "resilient_http_client.http.HttpExecutor.send",
            new=AsyncMock(side_effect=mock_send),
        ),
        patch(
            "resilient_http_client.retry.asyncio.sleep", new=AsyncMock()
        ),
    ):
        async with ResilientHttpClient(
            service=service_name, store=store, config=config
        ) as client:
            # Request 1 (Success)
            r1 = await client.request("GET", "http://mock/1")
            assert r1.status_code == 200

            # Request 2 (Success)
            r2 = await client.request("GET", "http://mock/2")
            assert r2.status_code == 200

            # Request 3 (Fails, retries once, records 2 failures)
            r3 = await client.request("GET", "http://mock/3")
            assert r3.status_code == 500

            # At this point:
            # 2 Successes, 2 Failures = 4 total calls in window.
            # minimum_number_of_calls is 5, so circuit should still be CLOSED.
            assert await store.get_state() == CircuitState.CLOSED.value

            # Request 4 (Fails, retries once, records 2 more failures)
            r4 = await client.request("GET", "http://mock/4")
            assert r4.status_code == 500

            # Now we have 2 Successes + 4 Failures = 6 total calls in window.
            # Failure rate = 4 / 6 = 66.7%, which is >= 50% threshold.
            # Minimum number of calls is 6 >= 5.
            # The circuit should have tripped open!
            assert await store.get_state() == CircuitState.OPEN.value

            # Request 5 should be blocked immediately (circuit open)
            r5 = await client.request("GET", "http://mock/5")
            assert r5.status_code == 503
            assert r5.json()["message"] == "circuit_open"
