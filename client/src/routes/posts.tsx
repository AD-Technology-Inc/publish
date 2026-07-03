import type { RouteObject } from "react-router-dom";

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
