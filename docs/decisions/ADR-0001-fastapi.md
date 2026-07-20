# ADR-0001: Adoption of FastAPI for Microservices & Gateway

## Context
The platform requires high-concurrency ingestion for reverse-proxy routing, async HTTP forwarding, dynamic OpenAPI documentation merging, and microservice REST endpoints.

## Problem
Traditional synchronous Python web frameworks (e.g., Django, Flask) require WSGI worker thread pools that incur significant memory and CPU overhead when handling thousands of concurrent non-blocking HTTP proxy connections.

## Decision
Adopt **FastAPI** (Python 3.12+) as the standard web framework across the API Gateway and microservices.

## Alternatives Considered
- **Flask + Gunicorn**: Simple ecosystem, but lacks native async/await support, requiring heavy thread pooling under concurrent I/O load.
- **Django Ninja**: Powerful ORM integration, but heavier framework footprint than needed for lightweight edge ingestion proxies.
- **Go / Gin**: Superior raw performance, but splits language stack across Python worker data pipelines and Go gateway proxies.

## Consequences
- Native `async/await` execution enables high non-blocking concurrency on edge ingestion requests.
- Automatic Pydantic v2 data validation and OpenAPI schema generation simplify Gateway schema aggregation (`openapi_merger.py`).

## Tradeoffs
- Requires careful handling when invoking synchronous libraries (e.g. `psycopg2`) to avoid blocking the asyncio event loop.
