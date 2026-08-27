FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN pip install --no-cache-dir uv

COPY services/social-post-service/pyproject.toml services/social-post-service/uv.lock* /app/services/social-post-service/
COPY services/shared/ /app/services/shared/

WORKDIR /app/services/social-post-service
RUN if [ -f uv.lock ]; then uv sync --frozen; else uv sync; fi

COPY services/social-post-service/ /app/services/social-post-service/

ENV PYTHONPATH="/app/services/shared"

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]