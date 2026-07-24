# Skill: .agent/engineering-standards/git-workflow-and-reviews/pull-request-standards.md

## 📌 Core Philosophy & Constraints
- **Atomic PR Sizing**: PRs MUST be kept small (< 400 lines changed) to ensure thorough reviews.
- **Mandatory PR Template**: Every PR MUST complete all sections of the standard PR template.
- **Green CI Required**: Zero failing tests, zero lint warnings, and clean build required prior to review request.
- **Self-Review First**: Author MUST perform a complete code review diff check before assigning reviewers.

## ⚡ Production Boilerplate / Standard Pattern

### GitHub Pull Request Template (`.github/PULL_REQUEST_TEMPLATE.md`)
```markdown
## 🎯 Overview
<!-- High-level summary of the architectural changes and business goals -->

## 🔗 Related Ticket / Issue
- Fixes #<!-- Issue ID -->

## 🧪 Changes Made
- [ ] Added new service action for user payload processing
- [ ] Integrated Pydantic v2 strict schema validation
- [ ] Updated Pest PHP integration test coverage

## 🛡️ Checklist
- [ ] Self-review completed on all diffs
- [ ] Unit & Integration test coverage added/updated
- [ ] Security headers and permission checks verified
- [ ] No unhandled exceptions or console log statements
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Monolithic PRs**: Submitting 1,000+ line diffs containing multiple unrelated features.
- ❌ **Empty Descriptions**: Opening PRs with blank templates or just a title.
- ❌ **Requesting Review with Failing CI**: Asking team members to review broken or unformatted code.
- ❌ **Ignoring Review Comments**: Resolving review conversations without providing code modifications or rationale.

## 🔍 Verification & Testing
- **PR Size Guard**: Automated GitHub Action step warning/blocking PRs exceeding 500 lines changed.
- **Template Validator**: CI check asserting mandatory PR template sections are populated.
