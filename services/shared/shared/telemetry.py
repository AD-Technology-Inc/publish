import structlog
from typing import Any

def setup_logging(service_name: str, level: str = "INFO"):
    """Configures structlog without standard logging library and without OTel."""
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.format_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            {"DEBUG": 10, "INFO": 20, "WARNING": 30, "ERROR": 40, "CRITICAL": 50}[level.upper()]
        ),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

def init_telemetry(service_name: str):
    """No-op telemetry initialization."""
    pass

class DummySpan:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        pass
    def set_attribute(self, key, value):
        pass
    def set_status(self, status):
        pass
    def record_exception(self, exception):
        pass

class DummyTracer:
    def start_as_current_span(self, name, *args, **kwargs):
        return DummySpan()

_dummy_tracer = DummyTracer()

def get_tracer():
    """Returns a dummy tracer context manager."""
    return _dummy_tracer

def get_meter():
    """No-op meter."""
    return None

def record_job_success(job_type: str, duration_s: float):
    """No-op metrics recording."""
    pass

def record_job_failure(job_type: str, duration_s: float, retryable: bool):
    """No-op metrics recording."""
    pass
