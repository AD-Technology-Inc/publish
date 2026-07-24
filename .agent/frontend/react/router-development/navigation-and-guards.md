# Skill: .agent/frontend/react/router-development/navigation-and-guards.md

## 📌 Core Philosophy & Constraints
- **Protected Route Wrapper**: Encapsulate authenticated routes in a reusable `<ProtectedRoute>` wrapper.
- **RBAC Scope Checks**: Inspect authenticated user roles against required route permissions.
- **Scroll & Focus Reset**: Reset scroll position to top on navigation transitions using `<ScrollToTop />`.

## ⚡ Production Boilerplate / Standard Pattern

```tsx
// src/components/ProtectedRoute.tsx
import React, { type FC, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Inline Router Redirect Logic**: Duplicating auth checks across individual page component bodies.
- ❌ **Imperative Navigation in Render**: Executing `navigate('/login')` directly during render phase without `Navigate` or `useEffect`.
- ❌ **Losing Redirect Target**: Navigating unauthenticated users without preserving original `location` query/state.

## 🔍 Verification & Testing
- **Protected Route Test**: Test `<ProtectedRoute>` with unauthenticated Zustand state asserting `<Navigate>` redirect to `/login`.
