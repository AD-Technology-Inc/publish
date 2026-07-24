# Skill: .agent/frontend/react/router-development/react-router.md

## 📌 Core Philosophy & Constraints
- **React Router v8+ Data Routers**: Use `createBrowserRouter` with `RouterProvider`.
- **Async Route Loaders & Actions**: Encapsulate data fetching inside route `loader` and `action` handlers.
- **Nested Layout Routes**: Structure layout routes with `<Outlet />` for consistent navigation hierarchy.

## ⚡ Production Boilerplate / Standard Pattern

```tsx
// src/router/index.tsx
import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, redirect } from 'react-router-dom';
import { apiClient } from '@/api/apiClient';

const RootLayout = () => (
  <div className="app-container">
    <header className="border-b p-4">Header Navigation</header>
    <main className="p-6"><Outlet /></main>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <div>Route Error Boundary</div>,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import('@/pages/HomePage');
          return { Component: HomePage };
        },
      },
      {
        path: 'dashboard',
        loader: async () => {
          const token = localStorage.getItem('auth_token');
          if (!token) return redirect('/login');
          const res = await apiClient.get('/user/dashboard');
          return res.data;
        },
        lazy: async () => {
          const { DashboardPage } = await import('@/pages/DashboardPage');
          return { Component: DashboardPage };
        },
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Legacy `<Routes>` Nesting**: Defining static `<Routes><Route path="..." /></Routes>` components without data APIs.
- ❌ **Eager Importing Route Components**: Importing all page views synchronously at top level of route definitions.
- ❌ **Missing `errorElement`**: Failing to attach boundary handlers to catch loader/action errors.

## 🔍 Verification & Testing
- **React Router Test Provider**: Test route resolution using `createMemoryRouter` in Vitest tests.
