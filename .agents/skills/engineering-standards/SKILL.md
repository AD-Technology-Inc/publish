---
name: engineering-standards
description: "Git branching, commit conventions, PR standards, code reviews, testing strategies, structured logging, and SaaS architecture."
---

# Engineering Standards & SaaS Architecture Skill Registry

This document serves as the master decision matrix and engineering specification reference for AI agents implementing software development standards, testing strategies, structured logging, and SaaS architectural patterns.

---

## 🛠️ Core Standards & Tooling Manifest

- **Version Control & Workflows**: Git 2.45+ (Trunk-Based / Feature-Branch Strategy)
- **Commit Format**: Conventional Commits 1.0.0 (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`)
- **Semantic Versioning**: SemVer 2.0.0 (`MAJOR.MINOR.PATCH`)
- **Testing Pyramid**: Unit Tests (80%+ coverage), Integration Tests, E2E Tests (Playwright)
- **Structured Logging**: JSON format with OpenTelemetry W3C Trace Context (`trace_id`, `span_id`, `tenant_id`)
- **SaaS Architecture**: Multi-Tenancy (Row-Level Security / Tenant-Isolated Schemas), RFC 7807 Problem Details

---

## 🔗 Sub-Skill Deep Dive References

- 🌿 **Branching Strategy**: [branching-strategy.md](./references/branching-strategy.md)
- 📝 **Commit Conventions**: [commit-conventions.md](./references/commit-conventions.md)
- 🔀 **Pull Request Standards**: [pull-request-standards.md](./references/pull-request-standards.md)
- 🔍 **Code Review Checklist**: [code-review-checklist.md](./references/code-review-checklist.md)
- 🧪 **Unit Testing Strategy**: [unit-testing.md](./references/unit-testing.md)
- 🧩 **Integration Testing**: [integration-testing.md](./references/integration-testing.md)
- 🎭 **E2E Testing (Playwright)**: [e2e-testing.md](./references/e2e-testing.md)
- 🎯 **Test-Driven Guidelines**: [test-driven-guidelines.md](./references/test-driven-guidelines.md)
- 📜 **Structured Logging**: [structured-logging.md](./references/structured-logging.md)
- 🆔 **Context & Tracing**: [context-and-tracing.md](./references/context-and-tracing.md)
- 📊 **Metrics & Alerts**: [metrics-and-alerts.md](./references/metrics-and-alerts.md)
- 🏢 **Multi-Tenancy SaaS**: [multi-tenancy.md](./references/multi-tenancy.md)
- 🚨 **Error Handling Standards**: [error-handling-standards.md](./references/error-handling-standards.md)
- 🛡️ **Fault Tolerance & Retries**: [fault-tolerance-reliability.md](./references/fault-tolerance-reliability.md)
- 🔒 **Security & Compliance**: [security-and-compliance.md](./references/security-and-compliance.md)

---

## 🧭 1. Engineering Standards Decision Matrix

| Engineering Area | Standard Pattern | Architectural Rule |
| :--- | :--- | :--- |
| **Branch Naming** | `feature/issue-desc`, `fix/bug-desc` | Short-lived branches merged back to `main` via squash-and-merge. |
| **Commit Messages** | `type(scope): imperative summary` | Mandatory `type` tag; concise summary in lowercase without trailing period. |
| **Multi-Tenancy** | Scope by `tenant_id` | Enforce explicit `where('tenant_id', tenantId)` filtering on every DB query. |
| **Structured Logs** | JSON Key-Value Format | Emit machine-parseable JSON logs containing timestamp, level, trace_id, and tenant_id. |
| **Fault Tolerance** | Retries with Exponential Jitter | Wrap external I/O with circuit breakers, timeouts, and randomized exponential backoffs. |
| **Error Format** | RFC 7807 Problem Details | Return standard JSON error payloads (`type`, `title`, `status`, `detail`, `instance`). |

---

## 🛠️ 2. Production Code Standard Pattern

```json
{
  "timestamp": "2026-08-06T08:30:00.000Z",
  "level": "INFO",
  "logger": "app.services.order_service",
  "message": "Order created successfully",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "tenant_id": "tenant_12345",
  "user_id": "usr_9988",
  "order_id": "ord_7711",
  "amount": 149.99
}
```

```text
feat(auth): implement OAuth2 JWT refresh token rotation strategy

- Add refreshToken service method with Redis JTI blacklisting
- Add unit test coverage for expired refresh token revocation
- Enforce HTTP-only secure cookie flags on login response

Closes #142
```

---

## 🚫 Forbidden Anti-Patterns

- ❌ **Direct Pushes to Main**: Pushing code directly to protected primary branches without pull requests and green CI checks.
- ❌ **Vague Commit Messages**: Using generic commit messages like `"wip"`, `"fix stuff"`, or `"updates"`.
- ❌ **Cross-Tenant Data Leakage**: Querying multi-tenant database tables without explicit `tenant_id` filters or RLS policies.
- ❌ **Unstructured String Logging**: Writing `print("User logged in " + str(user))` instead of JSON key-value log events.
- ❌ **Silent Exception Swallowing**: Swallowing errors in empty `try/except` blocks without logging context or re-raising.

---

## 🔍 Verification & Quality Assurance

- **Commit Validation**: Run `npx commitlint` on Git hooks ensuring Conventional Commits compliance.
- **Coverage Enforcement**: Assert min 80% test coverage requirement in CI pipelines before allowing PR merge.