## Purpose

This document defines the single source of truth pattern for routing using `react-router-dom` (v6.4+). It enforces:

- A typed route manifest
- Centralized path generation
- Lazy-loaded route modules
- No hardcoded route strings anywhere in the app

---

## Core Architecture

Routing is split into two layers:

### 1. Route Manifest (Source of Truth)

A strongly typed, immutable object containing all route definitions.

### 2. Route Configuration (React Router Mapping)

A `RouteObject[]` that maps manifest paths to lazy-loaded page components.

---

## Route Manifest Rules

### Required Structure

- Must use `as const`
- Every route must include:
    - `name` (dot-notation string)
    - `path` (string)
- Dynamic routes must include `getPath()` helper

### Example

```ts
export const routes = {
    index: {
        name: "posts.index",
        path: "/posts",
    },
    create: {
        name: "posts.create",
        path: "/posts/create",
    },
    analytics: {
        name: "posts.analytics",
        path: "/posts/analytics",
    },
    show: {
        name: "posts.show",
        path: "/posts/:id",
        getPath: (id: string | number) => `/posts/${id}` as const,
    },
} as const;

export type RouteName = keyof typeof routes;
```

---

## Route Configuration Rules

### Requirements

- Must use `lazy` (no static imports)
- Must reference `routes.*.path`
- Must import pages from `@/pages/`
- Must import components from `@/components/`

### Example

```ts
import type { RouteObject } from "react-router-dom";
import { routes } from "./routes";

export const postsRoutes: RouteObject[] = [
    {
        path: routes.index.path,
        lazy: async () => ({
            Component: (await import("@/pages/posts/Index")).default,
        }),
    },
    {
        path: routes.create.path,
        lazy: async () => ({
            Component: (await import("@/pages/posts/Create")).default,
        }),
    },
    {
        path: routes.analytics.path,
        lazy: async () => ({
            Component: (await import("@/pages/posts/Analytics")).default,
        }),
    },
    {
        path: routes.show.path,
        lazy: async () => ({
            Component: (await import("@/pages/posts/Show")).default,
        }),
    },
];
```

---

## Usage Rules (STRICT)

### Navigation

#### Static routes

```ts
<Link to={routes.index.path} />
navigate(routes.index.path)
```

#### Dynamic routes

```ts
<Link to={routes.show.getPath(id)} />
navigate(routes.show.getPath(id))
```

---

## Forbidden Patterns

Never do any of the following:

```ts
<Link to="/posts" />
navigate("/posts")
path: "/posts/create"
```

All route strings must come from the manifest.

---

## Dynamic Route Rules

- All `:params` must have `getPath()` helpers
- Helpers must return template strings cast as `as const`

Example:

```ts
getPath: (postId: string | number, commentId: string | number) =>
    `/posts/${postId}/comments/${commentId}` as const,
```

---

## Layout & Nested Routes

Use `index: true` for default routes.

```ts
{
    path: "/posts",
    lazy: async () => ({
        Component: (await import("@/pages/posts/Layout")).default,
    }),
    children: [
        {
            index: true,
            lazy: async () => ({
                Component: (await import("@/pages/posts/Index")).default,
            }),
        },
        {
            path: "create",
            lazy: async () => ({
                Component: (await import("@/pages/posts/Create")).default,
            }),
        },
    ],
}
```

---

## File Structure

Recommended structure:

```
src/
├── routes/
│   ├── posts.ts
│   ├── users.ts
│   └── index.ts
│
├── pages/
│   ├── posts/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   ├── Show.tsx
│   │   └── Analytics.tsx
```

---

## Design Principle

> The route manifest is the single source of truth.
> React Router is only a renderer of that manifest.

No duplication. No string routes. No exceptions.
