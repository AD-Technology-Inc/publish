# Skill: .agent/cloud-devops/cicd/github-actions/automated-testing-pipeline.md

## 📌 Core Philosophy & Constraints
- **Matrix Testing**: Test across target runtime versions (Node 20/22, Python 3.11/3.12, PHP 8.2/8.3).
- **Fast Dependency Caching**: Use official setup action caching (`cache: 'pip'`, `cache: 'npm'`, `setup-uv`).
- **Parallel Test Execution**: Run unit and integration tests in parallel jobs to minimize CI execution time.

## ⚡ Production Boilerplate / Standard Pattern

```yaml
name: Automated Testing Pipeline

on:
  push:
    branches: [main, staging, production]
  pull_request:
    branches: [main, staging, production]

jobs:
  python-test-matrix:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.11', '3.12']
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_DB: postgres
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
          DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost:5432/postgres
        run: uv run pytest tests/
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Uncached Dependency Downloads**: Re-downloading npm or pip packages on every CI run without cache actions.
- ❌ **Sequential Matrix Testing**: Running version matrix tests sequentially instead of parallel GitHub jobs.
- ❌ **Bypassing Tests for PRs**: Merging PRs without requiring green automated test suite passes.

## 🔍 Verification & Testing
- **CI Matrix Assertion**: Verify GitHub Actions workflow runs matrix jobs in parallel and passes cleanly.
