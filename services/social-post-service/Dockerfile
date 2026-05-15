FROM python:3.12-slim

WORKDIR /app
RUN pip install --no-cache-dir uv

COPY services/social-post-service/pyproject.toml services/social-post-service/uv.lock* /app/services/social-post-service/
COPY services/shared/ /app/services/shared/

WORKDIR /app/services/social-post-service
# We use a wildcard for uv.lock in case it doesn't exist yet
RUN if [ -f uv.lock ]; then uv sync --frozen; else uv sync; fi

COPY services/social-post-service/ /app/services/social-post-service/

EXPOSE 3001
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3001"]