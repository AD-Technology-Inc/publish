# Skill: .agent/engineering-standards/testing-strategy/test-driven-guidelines.md

## 📌 Core Philosophy & Constraints
- **Red-Green-Refactor**: Write a failing test first, implement minimal code to pass, then refactor cleanly.
- **Specification as Code**: Tests document feature specifications and requirements.
- **Coverage Target**: Minimum 80% line coverage for backend domain services and frontend business composables.

## ⚡ Production Boilerplate / Standard Pattern

### TDD Workflow Cycle

```text
🔴 Step 1: Write failing test describing desired output/behavior
🟢 Step 2: Implement minimal production logic required to pass assertion
🔵 Step 3: Refactor code structure without breaking existing test assertions
```

```typescript
// Step 1: Failing Test (Vitest)
import { describe, it, expect } from 'vitest';
import { calculateDiscount } from './discount';

describe('calculateDiscount', () => {
  it('applies 20% discount for VIP tier users', () => {
    const result = calculateDiscount(100, 'VIP');
    expect(result).toBe(80);
  });
});

// Step 2: Minimal Passing Implementation
export function calculateDiscount(amount: number, userTier: string): number {
  if (userTier === 'VIP') return amount * 0.8;
  return amount;
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Retroactive Test Writing**: Writing tests long after feature completion just to satisfy CI coverage.
- ❌ **Over-Engineering in Step 2**: Adding extra unrequested utility methods before tests require them.
- ❌ **Deleting Tests During Refactoring**: Removing assertions when internal structures change.

## 🔍 Verification & Testing
- **Coverage Command**: `pytest --cov=app --cov-fail-under=80` or `vitest run --coverage`
- **CI Enforcement**: Fail build pipeline if PR coverage drops below baseline.
