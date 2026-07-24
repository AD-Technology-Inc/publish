# Skill: .agent/frontend/react/state-and-data/local-global-state.md

## 📌 Core Philosophy & Constraints
- **Local vs Global State**: Keep UI state (`useState`) local; place shared application state in Zustand stores.
- **Atomic Selectors**: Use atomic selectors with Zustand (`useStore(state => state.user)`) to avoid unnecessary re-renders.
- **Reducers for Complex State**: Use `useReducer` for complex multi-field local form transitions.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// src/stores/useAuthStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        setSession: (user, token) => set({ user, token, isAuthenticated: true }),
        logout: () => set({ user: null, token: null, isAuthenticated: false }),
      }),
      { name: 'auth-storage' }
    )
  )
);
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Global Context for High-Frequency State**: Putting fast-changing state (e.g. mouse position, input fields) in React Context.
- ❌ **Whole-Store Destructuring**: Writing `const store = useAuthStore()` causing component re-render on any store change.
- ❌ **Direct State Mutability**: Mutating Zustand state directly (`state.user = newObj`) without using `set()`.

## 🔍 Verification & Testing
- **Vitest Store Assertions**: Test Zustand store state transitions using `useAuthStore.getState().setSession(...)`.
