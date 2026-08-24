import logging
import os
from fastapi import FastAPI
from shared.telemetry import (
    init_telemetry,
    setup_logging,
    get_tracer,
    get_meter,
    record_job_success,
    record_job_failure,
)


def test_telemetry_disabled_mode(monkeypatch):
    monkeypatch.setenv("OTEL_SDK_DISABLED", "true")
    app = FastAPI(title="Test App")
    setup_logging("test-service")
    init_telemetry("test-service", app=app)

    tracer = get_tracer()
    assert tracer is not None

    record_job_success("publish_post", 0.45)
    record_job_failure("publish_post", 1.2, retryable=True)
    record_job_failure("publish_post", 0.1, retryable=False)


def test_logging_trace_context_injection():
    setup_logging("test-log-service")
    logger = logging.getLogger("test_logger")

    record = logger.makeRecord(
        name="test_logger",
        level=logging.INFO,
        fn="test_telemetry.py",
        lno=30,
        msg="Test log message",
        args=(),
        exc_info=None,
    )

    for handler in logging.getLogger().handlers:
        for f in handler.filters:
            f.filter(record)

    assert hasattr(record, "trace_id")
    assert hasattr(record, "span_id")
