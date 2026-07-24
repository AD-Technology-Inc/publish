# Skill: .agent/engineering-standards/git-workflow-and-reviews/code-review-checklist.md

## 📌 Core Philosophy & Constraints
- **Automated Verification First**: Linters, formatters, and static analysis MUST handle code formatting; human review focuses on architecture, security, and edge cases.
- **Constructive & Specific**: Feedback must be actionable, clear, and reference exact lines or standards.
- **Security & Reliability Focus**: Prioritize OWASP vulnerabilities, race conditions, memory leaks, and N+1 query patterns.

## ⚡ Production Boilerplate / Standard Pattern

### Reviewer Checklist Matrix

```markdown
### 1. Architecture & Design
- [ ] Is business logic strictly separated into Services/Actions (thin controllers)?
- [ ] Are input parameters properly validated using Pydantic/Zod/Form Requests?
- [ ] Are API endpoints RESTful and properly versioned (`/api/v1/`)?

### 2. Security & Data Scoping
- [ ] Is tenant data properly scoped (`tenant_id` check enforced)?
- [ ] Are authorization policies/gates verified before executing actions?
- [ ] Are sensitive fields (passwords, tokens, keys) masked from logs?

### 3. Performance & Databases
- [ ] Are eager loading statements (`with`/`options(joinedload)`) used to avoid N+1 queries?
- [ ] Are database indexes added for new foreign keys or filtered columns?
- [ ] Are async operations used properly without blocking thread loops?
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Manual Style Nitpicking**: Leaving review comments about indentation or quotes instead of using Prettier/Ruff.
- ❌ **Rubber-Stamp Approval**: Approving PRs without opening diffs or running test verification.
- ❌ **Unclear Action Items**: Leaving comments like "fix this" without explaining the problem or suggesting a solution.

## 🔍 Verification & Testing
- **CODEOWNERS Enforcement**: Enforce mandatory approval from domain owners for core paths (`/backend/`, `/frontend/`).
- **Review Verification**: Verify all review threads are explicitly marked resolved prior to merge.
