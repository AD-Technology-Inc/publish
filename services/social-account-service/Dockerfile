FROM python:3.12-slim

WORKDIR /app
RUN pip install --no-cache-dir uv

COPY services/social-account-service/pyproject.toml services/social-account-service/uv.lock* /app/services/social-account-service/
COPY services/shared/ /app/services/shared/

WORKDIR /app/services/social-account-service
RUN if [ -f uv.lock ]; then uv sync --frozen; else uv sync; fi

COPY services/social-account-service/ /app/services/social-account-service/

EXPOSE 3001
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3001"]