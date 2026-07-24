# Skill: .agent/engineering-standards/git-workflow-and-reviews/commit-conventions.md

## 📌 Core Philosophy & Constraints
- **Conventional Commits 1.0.0**: Mandatory adherence to standard format: `<type>(<scope>): <subject>`.
- **Imperative Mood**: Subjects MUST be written in imperative mood ("add", "fix", "change", not "added" or "adds").
- **Breaking Changes**: MUST include `!` before colon or `BREAKING CHANGE:` header in footer.
- **Allowed Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

## ⚡ Production Boilerplate / Standard Pattern

### Commitlint Configuration (`commitlint.config.js`)
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore']
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-full-stop': [2, 'never', '.'],
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never']
  }
};
```

### Example Valid Commits
```text
feat(auth): implement JWT refresh token rotation mechanism
fix(fastapi): resolve database connection pool leak under heavy load
refactor(laravel): extract payment processing logic to Action service
feat(api)!: migrate v1 user endpoints to v2 schema format
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Vague Subjects**: Commits like `fix stuff`, `wip`, `update code`, or `minor changes`.
- ❌ **Missing Scopes**: Omitting component or module context (e.g. `feat: add user login`).
- ❌ **Past Tense Verbs**: Using `added`, `fixed`, `refactored` instead of `add`, `fix`, `refactor`.
- ❌ **Combining Unrelated Changes**: Multi-concern commits mixing refactoring with new feature logic.

## 🔍 Verification & Testing
- **Local Test**: Run `npx commitlint --from=HEAD~1` to validate commit messages.
- **Git Hook**: Enforce via Husky `commit-msg` hook asserting Conventional Commits specification.
