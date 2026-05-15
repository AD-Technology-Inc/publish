import os
import structlog
from typing import Any
from opentelemetry import trace, metrics, propagate
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

# Global OTel components
_tracer = None
_meter = None

# Metrics instruments
_jobs_counter = None
_job_duration_histogram = None
_job_retries_counter = None
_dlq_depth_gauge = None

def add_otel_context(logger: Any, method_name: str, event_dict: dict) -> dict:
    """Manual extraction of trace context for structured logs."""
    span = trace.get_current_span()
    if span and span.get_span_context().is_valid:
        event_dict["traceId"] = format(span.get_span_context().trace_id, "032x")
        event_dict["spanId"] = format(span.get_span_context().span_id, "016x")
    return event_dict

def setup_logging(service_name: str, level: str = "INFO"):
    """Configures structlog without standard logging library."""
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.format_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            add_otel_context,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            {"DEBUG": 10, "INFO": 20, "WARNING": 30, "ERROR": 40, "CRITICAL": 50}[level.upper()]
        ),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

def init_telemetry(service_name: str):
    """Explicitly initialize OpenTelemetry Providers and Exporters."""
    global _tracer, _meter, _jobs_counter, _job_duration_histogram, _job_retries_counter, _dlq_depth_gauge

    resource = Resource(attributes={SERVICE_NAME: service_name})
    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317")

    # Trace Setup
    tracer_provider = TracerProvider(resource=resource)
    span_exporter = OTLPSpanExporter(endpoint=endpoint, insecure=True)
    tracer_provider.add_span_processor(BatchSpanProcessor(span_exporter))
    trace.set_tracer_provider(tracer_provider)
    _tracer = trace.get_tracer(service_name)

    # Metrics Setup
    metric_exporter = OTLPMetricExporter(endpoint=endpoint, insecure=True)
    reader = PeriodicExportingMetricReader(metric_exporter, export_interval_millis=15000)
    meter_provider = MeterProvider(resource=resource, metric_readers=[reader])
    metrics.set_meter_provider(meter_provider)
    _meter = metrics.get_meter(service_name)

    # Propagation Setup
    propagate.set_global_textmap(TraceContextTextMapPropagator())

    # Initialize Instruments
    _jobs_counter = _meter.create_counter("posexei.jobs", description="Total jobs processed", unit="{job}")
    _job_duration_histogram = _meter.create_histogram("posexei.job.duration", description="Job processing duration", unit="s")
    _job_retries_counter = _meter.create_counter("posexei.job.retries", description="Total job retries", unit="{retry}")
    _dlq_depth_gauge = _meter.create_up_down_counter("posexei.dlq.depth", description="Messages in DLQ", unit="{message}")

def get_tracer():
    return _tracer if _tracer else trace.get_tracer("default")

def get_meter():
    return _meter

def record_job_success(job_type: str, duration_s: float):
    if _jobs_counter:
        _jobs_counter.add(1, {"job_type": job_type, "status": "success"})
    if _job_duration_histogram:
        _job_duration_histogram.record(duration_s, {"job_type": job_type, "status": "success"})

def record_job_failure(job_type: str, duration_s: float, retryable: bool):
    status = "retry" if retryable else "dlq"
    if _jobs_counter:
        _jobs_counter.add(1, {"job_type": job_type, "status": status})
    if _job_duration_histogram:
        _job_duration_histogram.record(duration_s, {"job_type": job_type, "status": status})
    if retryable and _job_retries_counter:
        _job_retries_counter.add(1, {"job_type": job_type})

def record_dlq_depth_change(stream: str, delta: int):
    if _dlq_depth_gauge:
        _dlq_depth_gauge.add(delta, {"stream": stream})
