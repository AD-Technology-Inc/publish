# Skill: .agent/cloud-devops/cicd/SKILL.md

# CI/CD Automated Pipelines & Release Management Skill Registry

This document serves as the automation decision matrix and GitHub Actions workflow specification reference for AI agents building continuous integration and deployment pipelines.

---

## 🛠️ Tech Stack & GitHub Actions Manifest

- **Pipeline Engine**: GitHub Actions Workflows (`.github/workflows/*.yml`)
- **Checkout Action**: `actions/checkout@v4`
- **Python Setup**: `astral-sh/setup-uv@v5` (Fast dependency caching & `uv sync`)
- **AWS Authentication**: `aws-actions/configure-aws-credentials@v4` (OIDC OpenID Connect)
- **Docker Build & Push**: `docker/setup-buildx-action@v3` + `docker/build-push-action@v5`
- **Secrets Management**: AWS Secrets Manager v2 (`aws-actions/aws-secretsmanager-get-secrets@v2`)

---

## 🔗 Sub-Skill Deep Dive References

- 🧪 **Automated Testing Pipeline**: [automated-testing-pipeline.md](./github-actions/automated-testing-pipeline.md)
- 🐳 **Docker Build & Push**: [docker-build-and-push.md](./github-actions/docker-build-and-push.md)
- 🚀 **Deployment Workflows**: [deployment-workflows.md](./github-actions/deployment-workflows.md)
- 🔑 **Environment Secrets**: [environment-secrets.md](./release-management/environment-secrets.md)
- 🔄 **Zero-Downtime Deployments**: [zero-downtime-deployments.md](./release-management/zero-downtime-deployments.md)

---

## 🧭 1. CI/CD Decision Matrix

| Pipeline Phase | Recommended Tool / Action | Architectural Rule |
| :--- | :--- | :--- |
| **Matrix Testing** | GitHub Actions Strategy Matrix | Run unit/integration tests in parallel across Node 20/22, Python 3.12, PHP 8.3. |
| **Dependency Caching** | Native Action Caching (`setup-uv`, `cache: 'npm'`) | Cache dependencies to minimize CI build times. Never re-download on every run. |
| **Cloud Authentication** | OIDC Credentials (`configure-aws-credentials@v4`) | Use short-lived OIDC role assumption instead of long-lived static AWS access keys. |
| **Container Build** | Buildx + Layer Cache (`type=gha`) | Build multi-platform Docker images with GitHub Actions cache backends. |
| **Production Release** | Blue/Green Deployment Workflow | Perform zero-downtime updates with automated healthcheck validation before switching traffic. |

---

## 🛠️ 2. Production GitHub Actions Standard Pattern

```yaml
name: Automated Testing Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

jobs:
  python-test-matrix:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.12']
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4

      - name: Install uv
        uses: astral-sh/setup-uv@v5
        with:
          enable-cache: true

      - name: Set up Python ${{ matrix.python-version }}
        run: uv python install ${{ matrix.python-version }}

      - name: Install dependencies
        run: uv sync --all-extras --dev

      - name: Run Pytest Suite
        env:
          DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost:5432/test_db
        run: uv run pytest tests/
```

---

## 🚫 Forbidden Anti-Patterns

- ❌ **Hardcoded Secrets**: Inlining passwords, private keys, or API tokens inside `.github/workflows/` files.
- ❌ **Uncached Pipeline Runs**: Re-downloading npm packages or Python wheels on every commit without cache actions.
- ❌ **Static AWS Credentials**: Using long-lived `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` secrets instead of OIDC.
- ❌ **Direct Main Branch Merges**: Merging pull requests without requiring green automated test workflow passes.

---

## 🔍 Verification & Quality Assurance

- **Workflow Syntax Check**: Validate GitHub Actions YAML structure using `actionlint`.
- **Pipeline Status Check**: Verify workflow execution passes 100% cleanly in GitHub Actions UI.
