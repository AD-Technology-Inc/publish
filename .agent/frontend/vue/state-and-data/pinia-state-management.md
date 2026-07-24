# Skill: .agent/frontend/vue/state-and-data/pinia-state-management.md

## 📌 Core Philosophy & Constraints
- **Setup Stores Syntax**: Use function-style `defineStore('id', () => { ... })` exclusively.
- **Modular Stores**: Split stores by domain entity (e.g. `useAuthStore`, `useCartStore`).
- **Store To Refs**: Use `storeToRefs()` when destructuring reactive state to prevent loss of reactivity.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// src/stores/useAuthStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
  id: string;
  email: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  // Getters
  const isAuthenticated = computed<boolean>(() => !!token.value && !!user.value);
  const isAdmin = computed<boolean>(() => user.value?.role === 'admin');

  // Actions
  function setSession(userData: User, authToken: string): void {
    user.value = userData;
    token.value = authToken;
    localStorage.setItem('token', authToken);
  }

  function logout(): void {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    setSession,
    logout,
  };
});
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Direct State Destructuring**: `const { user } = useAuthStore()` without `storeToRefs()`.
- ❌ **Options Store Syntax**: Using legacy `{ state: () => ({}), actions: {} }` syntax.
- ❌ **Direct LocalStorage Mutation in Components**: Bypassing store actions to modify auth state directly in SFC components.

## 🔍 Verification & Testing
- **Pinia Testing**: Use `setActivePinia(createPinia())` in Vitest tests to isolate store state per test case.
