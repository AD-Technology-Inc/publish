# Skill: .agent/engineering-standards/git-workflow-and-reviews/branching-strategy.md

## 📌 Core Philosophy & Constraints
- **Trunk-Based Development**: `main` branch is always release-ready and production-stable.
- **Short-Lived Feature Branches**: Branches MUST live < 48 hours to minimize merge drift.
- **Strict Naming Rules**: All branch names MUST follow `type/issue-id-short-description` format:
  - `feat/ENG-101-user-authentication`
  - `fix/ENG-204-redis-connection-leak`
  - `refactor/ENG-305-checkout-service`
  - `chore/ENG-402-update-dependencies`

## ⚡ Production Boilerplate / Standard Pattern

### Git Pre-Commit Hook (Branch Name Guard)
```bash
#!/usr/bin/env bash
# .git/hooks/pre-push or CI step enforcing branch naming convention

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
VALID_PATTERN="^(main|staging|feat\/[A-Z]+-[0-9]+-[a-z0-9-]+|fix\/[A-Z]+-[0-9]+-[a-z0-9-]+|refactor\/[A-Z]+-[0-9]+-[a-z0-9-]+|chore\/[A-Z]+-[0-9]+-[a-z0-9-]+)$"

if [[ ! $CURRENT_BRANCH =~ $VALID_PATTERN ]]; then
    echo "❌ Invalid branch name: '$CURRENT_BRANCH'"
    echo "💡 Branch names must match: type/JIRA-ID-description (e.g., feat/ENG-101-user-auth)"
    exit 1
fi

echo "✅ Branch name compliance verified: $CURRENT_BRANCH"
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Direct Commits to `main`**: Pushing commits directly to release trunks without PR review.
- ❌ **Long-Lived Feature Branches**: Keeping feature branches open for weeks causing massive merge conflicts.
- ❌ **Unstructured Branch Names**: Names like `test-fix`, `john-dev`, or `temp-work`.
- ❌ **Stale Branch Retention**: Leaving merged feature branches on origin remote after PR completion.

## 🔍 Verification & Testing
- **Local Validation**: Run git pre-push hook locally to verify current branch name format.
- **CI Assertion**: GitHub Actions workflow step `git-branch-check` fails if PR source branch violates `$VALID_PATTERN`.
