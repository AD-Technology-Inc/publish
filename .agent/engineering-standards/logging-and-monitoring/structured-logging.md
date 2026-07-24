# Skill: .agent/engineering-standards/logging-and-monitoring/structured-logging.md

## 📌 Core Philosophy & Constraints
- **Strict JSON Format**: Production logs MUST be emitted as single-line JSON objects to standard output.
- **Mandatory Fields**: Every log entry MUST include `timestamp` (ISO-8601), `level`, `event`, and `correlation_id`.
- **Sensitive Data Masking**: Passwords, API tokens, credit cards, and PII MUST NEVER be logged.

## ⚡ Production Boilerplate / Standard Pattern

### Python Structlog Production Setup
```python
import logging
import structlog

def configure_logging():
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True
    )

logger = structlog.get_logger()

# Usage Example
logger.info(
    "user_authenticated",
    user_id=42,
    tenant_id="tenant_abc",
    login_method="oauth2"
)
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unstructured Console Logs**: Using `print()`, `console.log()`, or `echo` in production code.
- ❌ **String Concatenation in Logs**: Formatting message strings (`logger.info(f"User {id} logged in")`) instead of passing key-value kwargs.
- ❌ **Logging Secrets**: Emitting bearer tokens, authorization headers, or database connection strings.

## 🔍 Verification & Testing
- **JSON Validator Test**: Assert stdout lines parse as valid JSON objects.
- **Log Masking Test**: Unit test verifying sensitive context variables are scrubbed prior to emission.
