import type { RouteObject } from "react-router-dom";
// -------------------------
// src: https://react.dev/reference/react/lazy
// src: https://reactrouter.com/start/data/route-object#lazy
// -------------------------

export const routes = {
    login: {
        name: "login",
        path: "/login",
    },
    register: {
        name: "register",
        path: "/register",
    },
} as const;

export const authRoutes: RouteObject[] = [
    {
        path: routes.login.path,
        lazy: async () => ({
            Component: (await import("@/pages/auth/Login")).default,
        }),
    },
    {
        path: routes.register.path,
        lazy: async () => ({
            Component: (await import("@/pages/auth/Register")).default,
        }),
    },
];
