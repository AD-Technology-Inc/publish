# Skill: .agent/cloud-devops/docker/containerization/security-and-non-root.md

## 📌 Core Philosophy & Constraints
- **Unprivileged User Execution**: Never run application processes as `root`; create a dedicated unprivileged user (`appuser`).
- **Secret Protection**: Pass runtime secrets via environment variables or secret mounts; never embed secrets in Docker images.
- **Vulnerability Scanning**: Scan production images with Trivy or Docker Scout in CI pipelines.

## ⚡ Production Boilerplate / Standard Pattern

```dockerfile
FROM python:3.12-slim

# Create unprivileged system group and user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/false appuser

WORKDIR /app
COPY --chown=appuser:appgroup . /app

# Drop root privileges
USER appuser:appgroup

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Trivy Vulnerability Scan Command
trivy image --severity HIGH,CRITICAL my-app:latest
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Running as Root**: Omitting `USER appuser` instruction leaving container execution vulnerable to privilege escalation.
- ❌ **Hardcoded Environment Credentials**: Storing API keys or passwords inside `ENV` instructions in Dockerfiles.
- ❌ **Ignoring High/Critical CVEs**: Deploying production images with known unpatched security vulnerabilities.

## 🔍 Verification & Testing
- **Non-Root Check**: `docker run --rm my-app:latest whoami` asserting output returns `appuser` (not `root`).
