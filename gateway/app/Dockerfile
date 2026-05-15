FROM python:3.12-slim

WORKDIR /app
RUN pip install --no-cache-dir uv

COPY gateway/app/pyproject.toml gateway/app/uv.lock /app/gateway/app/
COPY services/shared/pyproject.toml /app/services/shared/

WORKDIR /app/gateway/app
RUN uv sync --frozen

COPY gateway/app/ /app/gateway/app/
COPY services/shared/ /app/services/shared/

EXPOSE 3001

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3001", "--proxy-headers", "--reload"]