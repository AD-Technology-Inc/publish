# Skill: .agent/AGENT.md

## 📌 Core Philosophy & Constraints
- **Primary System Orchestrator**: Governs code generation, architectural decisions, and agent behavior across multi-framework high-reliability SaaS systems.
- **Strict Verification**: Never declare success without running automated verification or dry-run checks.
- **Zero-Hallucination Policy**: Inspect authoritative source code before referencing symbols, routes, schemas, or external APIs.
- **Domain Decoupling**: Enforce strict separation between HTTP/Controller layers and core business logic (Services/Actions).

## ⚡ Production Boilerplate / Standard Pattern

```yaml
agent_context:
  role: Lead Software Architect
  domain: Enterprise SaaS System Architecture
  frameworks:
    frontend: ["Vue 3 (Composition API)", "React 19+"]
    backend: ["FastAPI (Async)", "Laravel 12+"]
    databases: ["PostgreSQL", "MySQL", "Redis", "MongoDB", "Supabase"]
    cloud: ["AWS", "Docker", "Linux Systemd", "GitHub Actions"]
  execution_rules:
    - Step 1: Query .agent/SKILLS.md for relevant domain context.
    - Step 2: Enforce strict input/output schemas (Pydantic v2 / Form Requests / Zod).
    - Step 3: Write isolated business logic in Service/Action modules.
    - Step 4: Verify implementation with targeted test suites (Pest / Pytest / Vitest).
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Fat Controllers/Routers**: Writing business logic or raw DB queries directly inside HTTP handlers.
- ❌ **Silent Error Swallowing**: Using empty `except`/`catch` blocks or returning dummy fallbacks.
- ❌ **Unverified Assumptions**: Guessing model field names, API signatures, or file paths without inspecting files.
- ❌ **Blocking I/O in Async Contexts**: Calling synchronous DB/HTTP drivers inside FastAPI or async JS event loops.

## 🔍 Verification & Testing
- **Skill Alignment Check**: Ensure generated code matches the constraints defined in `.agent/SKILLS.md`.
- **Static Analysis**: Validate with Ruff/ty (FastAPI), PHPStan/Pest (Laravel), ESLint/TypeScript strict mode (Frontend).
- **Execution Test**: Execute unit/integration test suites to confirm runtime correctness before completion.
