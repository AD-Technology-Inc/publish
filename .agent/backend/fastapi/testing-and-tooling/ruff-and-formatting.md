# Skill: .agent/backend/fastapi/testing-and-tooling/ruff-and-formatting.md

## 📌 Core Philosophy & Constraints
- **Ruff Linter & Formatter**: Standardize code formatting and linting on Ruff (`ruff check`, `ruff format`).
- **Strict Rule Selection**: Enable Pyflakes (`F`), pycodestyle (`E`, `W`), isort (`I`), and flake8-bugbear (`B`).
- **Line Length**: Enforce strict line length limits (e.g., 100-120 chars max).

## ⚡ Production Boilerplate / Standard Pattern

```toml
# pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # Pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "UP",  # pyupgrade
]
ignore = ["E501"] # Line length handled by formatter

[tool.ruff.lint.isort]
combine-as-imports = true
known-first-party = ["app"]
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Multiple Formatting Tools**: Mixing Black, Flake8, and Isort together when Ruff replaces all three.
- ❌ **Ignoring Import Order**: Writing un-sorted or circular imports at top level of Python modules.
- ❌ **Disabling Rules Globally**: Silencing lint rules globally (`ignore = ["ALL"]`) instead of fixing issues.

## 🔍 Verification & Testing
- **Execution Command**: `ruff check .` and `ruff format --check .` asserting clean output in CI.
