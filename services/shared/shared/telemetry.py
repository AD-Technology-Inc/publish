"""
Shared OpenTelemetry initialisation for AD. Publish services.

Wires:
  - TracerProvider  → OTLPSpanExporter (gRPC)
  - MeterProvider   → OTLPMetricExporter (gRPC) with job counter/histogram
  - LoggerProvider  → OTLPLogExporter (gRPC) for OTLP log shipping
  - structlog       → injects trace_id / span_id into every JSON record so
                      Grafana Loki can link directly to Tempo traces.
  - stdlib logging  → injects trace_id / span_id into logging.LogRecord so standard
                      log records correlate seamlessly with Grafana Loki.
  - FastAPI         → auto-instrumentation for route latency and tracing.

All exporters read OTEL_EXPORTER_OTLP_ENDPOINT from the environment
(default: http://localhost:4317). Set OTEL_SDK_DISABLED=true to revert
to no-op mode (e.g. unit tests without a collector).
"""

import logging
import os
import types
from typing import Any, Self

import structlog

# ---------------------------------------------------------------------------
# Optional OTel SDK — graceful degradation when packages are absent or
# OTEL_SDK_DISABLED=true is set (e.g. during unit tests).
# ---------------------------------------------------------------------------
_OTEL_DISABLED = os.getenv("OTEL_SDK_DISABLED", "false").lower() == "true"

try:
    from opentelemetry import metrics, trace
    from opentelemetry._logs import set_logger_provider
    from opentelemetry.exporter.otlp.proto.grpc._log_exporter import (
        OTLPLogExporter,
    )
    from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import (
        OTLPMetricExporter,
    )
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
        OTLPSpanExporter,
    )
    from opentelemetry.sdk._logs import LoggerProvider
    from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
    from opentelemetry.sdk.metrics import MeterProvider
    from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
    from opentelemetry.sdk.resources import SERVICE_NAME, Resource
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.trace import SpanKind, StatusCode  # re-exported for callers

    _OTEL_AVAILABLE = True
except ImportError:
    _OTEL_AVAILABLE = False
    SpanKind = None  # type: ignore[assignment]
    StatusCode = None  # type: ignore[assignment]

# ---------------------------------------------------------------------------
# Module-level state
# ---------------------------------------------------------------------------
_tracer_provider: Any = None
_tracer: Any = None
_meter: Any = None
_job_duration_histogram: Any = None
_job_counter: Any = None


# ---------------------------------------------------------------------------
# Standard library logging filter: inject trace_id & span_id into LogRecord
# ---------------------------------------------------------------------------
class _TraceContextFilter(logging.Filter):
    """Logging filter that injects active OTel trace and span IDs into LogRecords."""

    def filter(self, record: logging.LogRecord) -> bool:
        if _OTEL_AVAILABLE and not _OTEL_DISABLED:
            span = trace.get_current_span()
            ctx = span.get_span_context()
            if ctx and ctx.is_valid:
                record.trace_id = format(ctx.trace_id, "032x")
                record.span_id = format(ctx.span_id, "016x")
                record.trace_flags = format(ctx.trace_flags, "02x")
                return True
        record.trace_id = ""
        record.span_id = ""
        record.trace_flags = ""
        return True


# ---------------------------------------------------------------------------
# structlog processor: inject OTel trace / span IDs into every log record
# ---------------------------------------------------------------------------
def _inject_trace_context(
    logger: Any, method: str, event_dict: dict
) -> dict:
    """Structlog processor that injects active OTel trace context."""
    if _OTEL_AVAILABLE and not _OTEL_DISABLED:
        span = trace.get_current_span()
        ctx = span.get_span_context()
        if ctx and ctx.is_valid:
            event_dict["trace_id"] = format(ctx.trace_id, "032x")
            event_dict["span_id"] = format(ctx.span_id, "016x")
            event_dict["trace_flags"] = format(ctx.trace_flags, "02x")
    return event_dict


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def setup_logging(service_name: str, level: str = "INFO") -> None:
    """
    Configure structlog with JSON output and OTel trace-context injection.

    The trace_id / span_id fields in every log line allow Grafana Loki to
    surface a "View trace" link that navigates directly to Tempo.
    """
    log_level_int = {
        "DEBUG": 10,
        "INFO": 20,
        "WARNING": 30,
        "ERROR": 40,
        "CRITICAL": 50,
    }.get(level.upper(), 20)

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.add_log_level,
            structlog.processors.add_log_level,
            structlog.processors.format_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            # Inject trace_id / span_id AFTER timestamp so it appears early
            _inject_trace_context,
            # Add service name label for Loki stream selector
            structlog.processors.CallsiteParameterAdder(
                [
                    structlog.processors.CallsiteParameter.FUNC_NAME,
                    structlog.processors.CallsiteParameter.LINENO,
                ]
            ),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(log_level_int),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Wire stdlib logging so third-party libraries (httpx, uvicorn…)
    # flow through the same pipeline and carry trace context.
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level_int)
    
    # Remove existing handlers to avoid duplicate logs
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)
        
    handler = logging.StreamHandler()
    handler.setLevel(log_level_int)
    handler.addFilter(_TraceContextFilter())
    formatter = logging.Formatter(
        '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "name": "%(name)s", "message": "%(message)s", "trace_id": "%(trace_id)s", "span_id": "%(span_id)s"}'
    )
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)


def init_telemetry(service_name: str, app: Any = None) -> None:
    """
    Bootstrap the OTel SDK: tracer, meter, and logger providers.
    Optionally instruments a FastAPI application if provided.

    Reads OTEL_EXPORTER_OTLP_ENDPOINT (default: http://localhost:4317).
    Set OTEL_SDK_DISABLED=true to skip initialisation (useful in tests).
    """
    global _tracer_provider, _tracer, _meter, _job_duration_histogram, _job_counter

    if _OTEL_DISABLED or not _OTEL_AVAILABLE:
        _tracer = _DummyTracer()
        return

    endpoint = os.getenv(
        "OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317"
    )
    resource = Resource.create({SERVICE_NAME: service_name})

    # ------------------------------------------------------------------
    # Traces
    # ------------------------------------------------------------------
    _tracer_provider = TracerProvider(resource=resource)
    _tracer_provider.add_span_processor(
        BatchSpanProcessor(OTLPSpanExporter(endpoint=endpoint, insecure=True))
    )
    trace.set_tracer_provider(_tracer_provider)
    _tracer = trace.get_tracer(service_name)

    # ------------------------------------------------------------------
    # Metrics
    # ------------------------------------------------------------------
    metric_reader = PeriodicExportingMetricReader(
        OTLPMetricExporter(endpoint=endpoint, insecure=True),
        export_interval_millis=15_000,
    )
    meter_provider = MeterProvider(
        resource=resource, metric_readers=[metric_reader]
    )
    metrics.set_meter_provider(meter_provider)
    _meter = metrics.get_meter(service_name)

    _job_duration_histogram = _meter.create_histogram(
        name="job.processing.duration",
        description="Duration of job execution in seconds",
        unit="s",
    )
    _job_counter = _meter.create_counter(
        name="job.executions.total",
        description="Total number of job executions",
    )

    # ------------------------------------------------------------------
    # Logs (OTLP)
    # ------------------------------------------------------------------
    try:
        logger_provider = LoggerProvider(resource=resource)
        logger_provider.add_log_record_processor(
            BatchLogRecordProcessor(
                OTLPLogExporter(endpoint=endpoint, insecure=True)
            )
        )
        set_logger_provider(logger_provider)
    except Exception as e:
        # Non-fatal log provider init error
        logging.getLogger(__name__).debug("LoggerProvider init skipped: %s", e)

    # ------------------------------------------------------------------
    # FastAPI Auto-Instrumentation
    # ------------------------------------------------------------------
    if app is not None:
        instrument_fastapi(app)


def instrument_fastapi(app: Any) -> None:
    """Auto-instrument a FastAPI application instance with OpenTelemetry."""
    if _OTEL_DISABLED or not _OTEL_AVAILABLE:
        return
    try:
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        FastAPIInstrumentor.instrument_app(app, tracer_provider=_tracer_provider)
    except Exception as e:
        logging.getLogger(__name__).warning("Failed to instrument FastAPI app: %s", e)


def get_tracer() -> Any:
    """Return the active OTel tracer (or a DummyTracer in no-op mode)."""
    if _tracer is None:
        return _DummyTracer()
    return _tracer


def get_meter() -> Any:
    """Return the active OTel meter (or None in no-op mode)."""
    return _meter


def record_job_success(job_type: str, duration_s: float) -> None:
    """Record a successful job execution to OTel metrics."""
    if _job_duration_histogram is not None:
        _job_duration_histogram.record(
            duration_s,
            attributes={"job.type": job_type, "job.result": "success"},
        )
    if _job_counter is not None:
        _job_counter.add(
            1,
            attributes={"job.type": job_type, "job.result": "success"},
        )


def record_job_failure(
    job_type: str, duration_s: float, retryable: bool
) -> None:
    """Record a failed job execution to OTel metrics."""
    result = "failure_retryable" if retryable else "failure_permanent"
    if _job_duration_histogram is not None:
        _job_duration_histogram.record(
            duration_s,
            attributes={"job.type": job_type, "job.result": result},
        )
    if _job_counter is not None:
        _job_counter.add(
            1,
            attributes={"job.type": job_type, "job.result": result},
        )


# ---------------------------------------------------------------------------
# No-op fallbacks (used when OTel SDK is unavailable or disabled)
# ---------------------------------------------------------------------------

class _DummySpan:
    def __enter__(self) -> Self:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: types.TracebackType | None,
    ) -> None:
        pass

    def set_attribute(self, key: str, value: Any) -> None:
        pass

    def set_status(self, status: Any, description: str = "") -> None:
        pass

    def record_exception(self, exception: BaseException) -> None:
        pass

    def get_span_context(self) -> None:
        return None


class _DummyTracer:
    def start_as_current_span(
        self, name: str, *args: Any, **kwargs: Any
    ) -> _DummySpan:
        return _DummySpan()
