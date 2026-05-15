FROM python:3.12-slim

WORKDIR /app
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY services/identity-service/pyproject.toml services/identity-service/uv.lock /app/services/identity-service/
COPY services/shared/ /app/services/shared/

WORKDIR /app/services/identity-service
RUN uv sync --frozen

# Copy source code
COPY services/identity-service/ /app/services/identity-service/

EXPOSE 3001

# Default CMD (API)
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3001"]