# Skill: .agent/frontend/react/testing-and-perf/react-performance.md

## 📌 Core Philosophy & Constraints
- **Memoization Strategy**: Use `useMemo` for expensive computations and `useCallback` for stable function references passed to memoized children.
- **Virtualized Lists**: Use `@tanstack/react-virtual` or `react-window` for rendering large datasets (>100 items).
- **Code Splitting**: Lazy load route pages with `React.lazy()` and `<Suspense fallback={<Spinner />}>`.

## ⚡ Production Boilerplate / Standard Pattern

```tsx
import React, { type FC, useMemo, useCallback, lazy, Suspense } from 'react';

// 1. Lazy Loaded Heavy Modal Component
const HeavyDataModal = lazy(() => import('./HeavyDataModal'));

interface Item {
  id: string;
  price: number;
}

export const ProductList: FC<{ items: Item[] }> = React.memo(({ items }) => {
  // 2. Memoized Heavy Calculation
  const totalPrice = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price, 0);
  }, [items]);

  // 3. Stable Callback Reference
  const handleItemClick = useCallback((id: string) => {
    console.log('Clicked item:', id);
  }, []);

  return (
    <div>
      <h3>Total Price: ${totalPrice}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id} onClick={() => handleItemClick(item.id)}>
            {item.id} - ${item.price}
          </li>
        ))}
      </ul>

      <Suspense fallback={<div>Loading Modal...</div>}>
        <HeavyDataModal />
      </Suspense>
    </div>
  );
});
ProductList.displayName = 'ProductList';
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Premature Over-Memoization**: Wrapping simple primitive functions in `useCallback` without measuring re-render costs.
- ❌ **Rendering 1,000 DOM Nodes**: Mapping large array items directly without list virtualization.
- ❌ **Inline Arrow Functions in Props**: Passing `onClick={() => doSomething()}` to memoized child components breaking memoization.

## 🔍 Verification & Testing
- **React Profiler Check**: Verify component render duration remains < 16ms during parent state updates.
