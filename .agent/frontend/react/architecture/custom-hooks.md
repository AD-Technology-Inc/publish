# Skill: .agent/frontend/react/architecture/custom-hooks.md

## 📌 Core Philosophy & Constraints
- **Custom Hook Naming**: All custom hooks MUST be named starting with `useXxx`.
- **Exhaustive Dependencies**: Strictly satisfy `react-hooks/exhaustive-deps` rules in all `useEffect`/`useCallback` hooks.
- **Hook Encapsulation**: Extract stateful business logic out of components into reusable hooks.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]); // Satisfies exhaustive-deps

  return debouncedValue;
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Suppressing Linter Rules**: Adding `// eslint-disable-next-line react-hooks/exhaustive-deps` to bypass array dependency checks.
- ❌ **Conditional Hook Invocation**: Calling hooks inside `if` statements or loops.
- ❌ **Setting State in Effect Without Dependencies**: Triggering infinite render loops by setting state inside `useEffect` on every render.

## 🔍 Verification & Testing
- **React Testing Library Hook**: Test hook using `renderHook(() => useDebounce('test', 300))` in Vitest.
