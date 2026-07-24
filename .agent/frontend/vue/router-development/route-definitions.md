# Skill: .agent/frontend/vue/router-development/route-definitions.md

## 📌 Core Philosophy & Constraints
- **Lazy-Loaded Route Components**: Route views MUST use dynamic imports (`() => import(...)`) for code-splitting.
- **Strongly-Typed Meta Fields**: Extend Vue Router `RouteMeta` interface for authentication and RBAC roles.
- **Nested Views**: Group related sub-routes using component children layouts.

## ⚡ Production Boilerplate / Standard Pattern

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// Extend RouteMeta typing
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: Array<'admin' | 'user'>;
    title?: string;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'admin',
        name: 'admin-dashboard',
        component: () => import('@/views/AdminView.vue'),
        meta: { requiresAuth: true, roles: ['admin'], title: 'Admin Settings' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Eager Loading All Route Views**: Importing view components at top-level using standard `import View from ...`.
- ❌ **Untyped Route Meta**: Accessing `route.meta.requiresAuth` without declaring module type augmentations.
- ❌ **Catch-All Wildcard Omission**: Forgetting 404 catch-all routes (`/:pathMatch(.*)*`).

## 🔍 Verification & Testing
- **Router Integration Test**: Test navigation resolution in Vitest asserting dynamic component loading.
