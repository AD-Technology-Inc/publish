# Skill: .agent/frontend/core/typescript-javascript/esnext-patterns.md

## 📌 Core Philosophy & Constraints
- **Immutable Operations**: Use `structuredClone()`, spread syntax, and Array methods (`toSorted`, `toSpliced`, `map`, `filter`).
- **Modern ES Features**: Optional chaining (`?.`), Nullish coalescing (`??`), Logical assignment (`??=`), and `Object.groupBy()`.
- **Map/Set Data Structures**: Prefer `Map` and `Set` over plain objects for key-value lookups and uniqueness.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// Modern ES2024 Object & Array Manipulations
export interface OrderItem {
  id: string;
  category: 'electronics' | 'apparel';
  price: number;
}

export function processOrders(items: ReadonlyArray<OrderItem>) {
  // Safe Immutable Copy & Grouping
  const sorted = items.toSorted((a, b) => b.price - a.price);
  
  // ES2024 Object.groupBy
  const groupedByCategory = Object.groupBy(sorted, (item) => item.category);

  // Map lookup
  const categoryTotals = new Map<string, number>();

  for (const [category, groupItems] of Object.entries(groupedByCategory)) {
    const total = (groupItems ?? []).reduce((acc, item) => acc + item.price, 0);
    categoryTotals.set(category, total);
  }

  return { sorted, groupedByCategory, categoryTotals };
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Direct In-Place Mutation**: Using `.sort()`, `.splice()`, or direct object property mutation on props/state.
- ❌ **Loose Equality (`==`)**: Using double equals instead of strict equality `===`.
- ❌ **`var` Declarations**: Using `var` instead of block-scoped `const` or `let`.

## 🔍 Verification & Testing
- **Linter Rule**: ESLint rule `prefer-const` and `eqeqeq` enforcement.
