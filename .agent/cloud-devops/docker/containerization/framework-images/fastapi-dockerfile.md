# Skill: .agent/cloud-devops/docker/containerization/framework-images/fastapi-dockerfile.md

## 📌 Core Philosophy & Constraints
- **Official `astral-sh/uv` Image**: Use `ghcr.io/astral-sh/uv:python3.12-trixie-slim` base image for fast, native `uv` package management.
- **Cache Mounting**: Utilize BuildKit cache mounts (`--mount=type=cache,target=/root/.cache/uv`) for ultra-fast dependency restoration.
- **Strict Environment Pathing**: Set `UV_PROJECT_ENVIRONMENT=/app/.venv` and prepend `/app/.venv/bin` to system `PATH`.

## ⚡ Production Boilerplate / Standard Pattern

```dockerfile
# Set base image
FROM ghcr.io/astral-sh/uv:python3.12-trixie-slim

# Set the working directory
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV UV_PROJECT_ENVIRONMENT=/app/.venv

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

# Copy application
COPY . .

# Run the app
ENV PATH="/app/.venv/bin:$PATH"

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "3001"]
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Re-installing `uv` via `pip`**: Installing `uv` on top of standard Python base images instead of using `ghcr.io/astral-sh/uv`.
- ❌ **Disabling BuildKit Cache**: Omitting `--mount=type=cache,target=/root/.cache/uv` resulting in slow dependency downloads on builds.
- ❌ **Unbuffered Output Disabling**: Missing `PYTHONUNBUFFERED=1` causing delayed container log emission.

## 🔍 Verification & Testing
- **Container Build Check**: Run `docker build -t fastapi-app .` asserting `uv sync` utilizes cached layers.
