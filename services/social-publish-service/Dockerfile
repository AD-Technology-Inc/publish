FROM python:3.12-slim

WORKDIR /app
RUN pip install --no-cache-dir uv

COPY services/social-publish-service/pyproject.toml services/social-publish-service/uv.lock* /app/services/social-publish-service/
COPY services/shared/ /app/services/shared/

WORKDIR /app/services/social-publish-service
RUN if [ -f uv.lock ]; then uv sync --frozen; else uv sync; fi

COPY services/social-publish-service/ /app/services/social-publish-service/

EXPOSE 3001
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3001"]