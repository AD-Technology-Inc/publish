# Skill: .agent/frontend/vue/router-development/navigation-guards.md

## 📌 Core Philosophy & Constraints
- **Global Auth Guard**: Intercept all route transitions in `beforeEach` to validate authentication state.
- **RBAC Policy Check**: Verify current user roles match target `route.meta.roles`.
- **Title Updates**: Update document HTML title automatically on route navigation.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// src/router/guards.ts
import type { Router } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

export function setupNavigationGuards(router: Router): void {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // 1. Dynamic Page Title
    if (to.meta.title) {
      document.title = `${to.meta.title} | Enterprise App`;
    }

    // 2. Auth Protection Check
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return next({
        name: 'login',
        query: { redirect: to.fullPath },
      });
    }

    // 3. RBAC Role Verification
    if (to.meta.roles && authStore.user) {
      const hasRequiredRole = to.meta.roles.includes(authStore.user.role as any);
      if (!hasRequiredRole) {
        return next({ name: 'unauthorized' });
      }
    }

    next();
  });
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Multiple `next()` Calls**: Calling `next()` multiple times in a single guard execution path.
- ❌ **Client-Side Auth Only Guarding**: Relying exclusively on route guards without backend API authorization checks.
- ❌ **Infinite Redirect Loops**: Redirecting unauthenticated users to a login path that also requires auth.

## 🔍 Verification & Testing
- **Guard Unit Test**: Mock `useAuthStore` and verify `router.push('/admin')` redirects unauthenticated users to `/login`.
