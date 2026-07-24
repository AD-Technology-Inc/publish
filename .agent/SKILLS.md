# Skill: .agent/SKILLS.md

## 📌 Core Philosophy & Constraints
- **Master Routing Table**: Central index mapping every software domain, framework, and architecture pattern to its exact `.agent/` skill file.
- **Strict Categorization**: Categorized across `engineering-standards/`, `frontend/`, `backend/`, `databases/`, and `cloud-devops/`.
- **Deterministic Skill Loading**: Query and load the exact skill path matching user intent before generating code.

## ⚡ Production Boilerplate / Standard Pattern

| Domain Category | Sub-Domain / Topic | Skill Path |
| :--- | :--- | :--- |
| **Engineering Standards** | Branching Strategy | `.agent/engineering-standards/git-workflow-and-reviews/branching-strategy.md` |
| | Commit Conventions | `.agent/engineering-standards/git-workflow-and-reviews/commit-conventions.md` |
| | Pull Request Standards | `.agent/engineering-standards/git-workflow-and-reviews/pull-request-standards.md` |
| | Code Review Checklist | `.agent/engineering-standards/git-workflow-and-reviews/code-review-checklist.md` |
| | Unit Testing | `.agent/engineering-standards/testing-strategy/unit-testing.md` |
| | Integration Testing | `.agent/engineering-standards/testing-strategy/integration-testing.md` |
| | E2E Testing | `.agent/engineering-standards/testing-strategy/e2e-testing.md` |
| | TDD Guidelines | `.agent/engineering-standards/testing-strategy/test-driven-guidelines.md` |
| | Structured Logging | `.agent/engineering-standards/logging-and-monitoring/structured-logging.md` |
| | Context & Tracing | `.agent/engineering-standards/logging-and-monitoring/context-and-tracing.md` |
| | Metrics & Alerts | `.agent/engineering-standards/logging-and-monitoring/metrics-and-alerts.md` |
| | Multi-Tenancy | `.agent/engineering-standards/saas-architecture/multi-tenancy.md` |
| | Error Handling Standards | `.agent/engineering-standards/saas-architecture/error-handling-standards.md` |
| | Fault Tolerance & Retries | `.agent/engineering-standards/saas-architecture/fault-tolerance-reliability.md` |
| | Security & Compliance | `.agent/engineering-standards/saas-architecture/security-and-compliance.md` |
| **Frontend Core** | Strict Type Declarations | `.agent/frontend/core/typescript-javascript/strict-type-declarations.md` |
| | Async & Concurrency | `.agent/frontend/core/typescript-javascript/async-concurrency.md` |
| | ESNext Patterns | `.agent/frontend/core/typescript-javascript/esnext-patterns.md` |
| | Design System Tokens | `.agent/frontend/core/tailwind-css-html/design-system-tokens.md` |
| | Layout & Responsiveness | `.agent/frontend/core/tailwind-css-html/layout-and-responsiveness.md` |
| | Semantic HTML & A11y | `.agent/frontend/core/tailwind-css-html/semantic-html-a11y.md` |
| **Frontend (Vue 3)** | Root Tech Stack Index | `.agent/frontend/vue/SKILL.md` |
| | Composition API | `.agent/frontend/vue/architecture/composition-api.md` |
| | Composables Patterns | `.agent/frontend/vue/architecture/composables-patterns.md` |
| | Component Design | `.agent/frontend/vue/architecture/component-design.md` |
| | Pinia State Management | `.agent/frontend/vue/state-and-data/pinia-state-management.md` |
| | Axios API Client | `.agent/frontend/vue/state-and-data/axios-api-client.md` |
| | Route Definitions | `.agent/frontend/vue/router-development/route-definitions.md` |
| | Navigation Guards | `.agent/frontend/vue/router-development/navigation-guards.md` |
| | VeeValidate & Zod | `.agent/frontend/vue/forms-and-validation/vee-validate-zod.md` |
| | Shadcn Vue | `.agent/frontend/vue/UI-and-styling/shadcn-vue.md` |
| | Vitest Vue Test Utils | `.agent/frontend/vue/testing-and-perf/vitest-vue-test-utils.md` |
| | Playwright E2E | `.agent/frontend/vue/testing-and-perf/playwright.md` |
| | Vue Performance | `.agent/frontend/vue/testing-and-perf/vue-performance.md` |
| **Frontend (React 19)** | Root Tech Stack Index | `.agent/frontend/react/SKILL.md` |
| | Functional Components | `.agent/frontend/react/architecture/functional-components.md` |
| | Custom Hooks | `.agent/frontend/react/architecture/custom-hooks.md` |
| | Component Design | `.agent/frontend/react/architecture/component-design.md` |
| | Local & Global State | `.agent/frontend/react/state-and-data/local-global-state.md` |
| | Axios API Client | `.agent/frontend/react/state-and-data/axios-api-client.md` |
| | React Router v8+ | `.agent/frontend/react/router-development/react-router.md` |
| | Navigation & Guards | `.agent/frontend/react/router-development/navigation-and-guards.md` |
| | React Hook Form & Zod | `.agent/frontend/react/forms-and-validation/react-hook-form-zod.md` |
| | Shadcn UI | `.agent/frontend/react/UI-and-styling/shadcn-ui.md` |
| | Vitest Testing Library | `.agent/frontend/react/testing-and-perf/vitest-testing-library.md` |
| | Playwright E2E | `.agent/frontend/react/testing-and-perf/playwright.md` |
| | React Performance | `.agent/frontend/react/testing-and-perf/react-performance.md` |
| **Backend (Laravel 12)** | Root Tech Stack Index | `.agent/backend/laravel/SKILL.md` |
| | Controllers & Actions | `.agent/backend/laravel/architecture/controllers-and-actions.md` |
| | Services & Repositories | `.agent/backend/laravel/architecture/services-and-repositories.md` |
| | Middleware & Requests | `.agent/backend/laravel/architecture/middleware-and-requests.md` |
| | REST Endpoints v1 | `.agent/backend/laravel/router-development/rest-endpoints-v1.md` |
| | Authorization Policies | `.agent/backend/laravel/router-development/authorization.md` |
| | Sanctum Authentication | `.agent/backend/laravel/router-development/authentication.md` |
| | Rate Limiting | `.agent/backend/laravel/router-development/rate-limiting.md` |
| | Security Headers | `.agent/backend/laravel/router-development/security.md` |
| | Correlation Middleware | `.agent/backend/laravel/router-development/middleware.md` |
| | Error Handling | `.agent/backend/laravel/router-development/error-handling.md` |
| | Request & Resources | `.agent/backend/laravel/router-development/request-response.md` |
| | Pagination & Filtering | `.agent/backend/laravel/router-development/pagination-filter-sort.md` |
| | Queue Workers & Jobs | `.agent/backend/laravel/async-events-jobs/queue-workers-jobs.md` |
| | Event Listeners | `.agent/backend/laravel/async-events-jobs/event-listeners-subscribers.md` |
| | Reverb WebSockets | `.agent/backend/laravel/async-events-jobs/websockets-reverb.md` |
| | Pest Testing | `.agent/backend/laravel/testing/pest.md` |
| | DB Factories & Fakes | `.agent/backend/laravel/testing/database-factories-mocks.md` |
| **Backend (FastAPI)** | Root Tech Stack Index | `.agent/backend/fastapi/SKILL.md` |
| | Async & Pydantic v2 | `.agent/backend/fastapi/architecture/async-pydantic-v2.md` |
| | Dependency Injection | `.agent/backend/fastapi/architecture/dependency-injection.md` |
| | Application Factory | `.agent/backend/fastapi/architecture/application-factory.md` |
| | REST Endpoints v1 | `.agent/backend/fastapi/router-development/rest-endpoints-v1.md` |
| | Authorization Policies | `.agent/backend/fastapi/router-development/authorization.md` |
| | OAuth2 Authentication | `.agent/backend/fastapi/router-development/authentication.md` |
| | Rate Limiting | `.agent/backend/fastapi/router-development/rate-limiting.md` |
| | Security Middleware | `.agent/backend/fastapi/router-development/security.md` |
| | Correlation Middleware | `.agent/backend/fastapi/router-development/middleware.md` |
| | RFC 7807 Error Handling | `.agent/backend/fastapi/router-development/error-handling.md` |
| | Request & Responses | `.agent/backend/fastapi/router-development/request-response.md` |
| | Pagination & Sorting | `.agent/backend/fastapi/router-development/pagination-filter-sort.md` |
| | Async WebSockets | `.agent/backend/fastapi/async-events-jobs/async-websockets.md` |
| | Background Tasks | `.agent/backend/fastapi/async-events-jobs/background-tasks.md` |
| | Celery Redis Workers | `.agent/backend/fastapi/async-events-jobs/celery-redis-workers.md` |
| | Pytest AsyncIO | `.agent/backend/fastapi/testing-and-tooling/pytest-asyncio.md` |
| | Mock Dependencies | `.agent/backend/fastapi/testing-and-tooling/mock-dependencies.md` |
| | Ruff & Formatting | `.agent/backend/fastapi/testing-and-tooling/ruff-and-formatting.md` |
| **Backend Shared** | JWT & Sanctum Auth | `.agent/backend/shared/authentication-authz/jwt-oauth2-sanctum.md` |
| | RBAC Permissions | `.agent/backend/shared/authentication-authz/rbac-permissions.md` |
| | Session Security | `.agent/backend/shared/authentication-authz/session-security.md` |
| | Resilient HTTP Clients | `.agent/backend/shared/third-party-integrations/resilient-http-clients.md` |
| | Webhook Receivers | `.agent/backend/shared/third-party-integrations/webhook-receivers.md` |
| | Circuit Breakers | `.agent/backend/shared/third-party-integrations/circuit-breaker-pattern.md` |
| **Cloud & DevOps** | Linux Operations Registry | `.agent/cloud-devops/linux/SKILL.md` |
| | AWS Infrastructure Index | `.agent/cloud-devops/aws/SKILL.md` |
| | EC2 Instance Management | `.agent/cloud-devops/aws/infrastructure-and-compute/ec2-instance-management.md` |
| | ECS Docker Deployments | `.agent/cloud-devops/aws/infrastructure-and-compute/ecs-docker-deployments.md` |
| | Lambda Serverless | `.agent/cloud-devops/aws/infrastructure-and-compute/lambda-serverless.md` |
| | RDS PostgreSQL / MySQL | `.agent/cloud-devops/aws/data-and-storage/rds-postgresql-mysql.md` |
| | S3 & CloudFront CDN | `.agent/cloud-devops/aws/data-and-storage/s3-and-cloudfront.md` |
| | IAM Roles & Policies | `.agent/cloud-devops/aws/security-and-iam/iam-roles-and-policies.md` |
| | VPC & Networking | `.agent/cloud-devops/aws/security-and-iam/vpc-and-networking.md` |
| | Docker Containerization Index | `.agent/cloud-devops/docker/SKILL.md` |
| | Docker Multi-Stage | `.agent/cloud-devops/docker/containerization/multi-stage-builds.md` |
| | Docker Non-Root Security | `.agent/cloud-devops/docker/containerization/security-and-non-root.md` |
| | Docker Frontend Image | `.agent/cloud-devops/docker/containerization/framework-images/frontend-dockerfile.md` |
| | Docker FastAPI Image | `.agent/cloud-devops/docker/containerization/framework-images/fastapi-dockerfile.md` |
| | Docker Compose Dev | `.agent/cloud-devops/docker/orchestration/docker-compose-dev.md` |
| | Compose Traefik Stack | `.agent/cloud-devops/docker/orchestration/compose-traefik-postgres-redis.md` |
| | Healthchecks & Networks | `.agent/cloud-devops/docker/orchestration/healthchecks-and-networks.md` |
| | Server Hardening | `.agent/cloud-devops/linux/administration/server-hardening-security.md` |
| | Linux Systemd | `.agent/cloud-devops/linux/administration/process-management-systemd.md` |
| | Storage & Permissions | `.agent/cloud-devops/linux/administration/storage-and-permissions.md` |
| | Logrotate & Journald | `.agent/cloud-devops/linux/monitoring-and-maintenance/logrotate-and-journald.md` |
| | Shell Automation | `.agent/cloud-devops/linux/monitoring-and-maintenance/shell-scripting-automation.md` |
| | CI/CD Workflows Index | `.agent/cloud-devops/cicd/SKILL.md` |
| | Automated Testing Pipeline | `.agent/cloud-devops/cicd/github-actions/automated-testing-pipeline.md` |
| | Docker Build & Push | `.agent/cloud-devops/cicd/github-actions/docker-build-and-push.md` |
| | Deployment Workflows | `.agent/cloud-devops/cicd/github-actions/deployment-workflows.md` |
| | Environment Secrets | `.agent/cloud-devops/cicd/release-management/environment-secrets.md` |
| | Zero-Downtime Deployments | `.agent/cloud-devops/cicd/release-management/zero-downtime-deployments.md` |

## 🚫 Forbidden Anti-Patterns
- ❌ **Unmapped Skill Invocations**: Generating domain code without consulting the master skill index.
- ❌ **Broken Links**: Referencing skill paths in `.agent/` that do not exist or violate directory naming.
- ❌ **Overlapping Responsibilities**: Combining frontend and backend concerns into a single monolithic skill file.

## 🔍 Verification & Testing
- **Path Resolution Check**: Assert all paths listed in the table resolve to actual `.md` files in the repository.
- **Domain Coverage**: Ensure every core framework (Vue, React, Laravel, FastAPI, Cloud, Linux, Docker, CI/CD) has explicit skill mappings.
