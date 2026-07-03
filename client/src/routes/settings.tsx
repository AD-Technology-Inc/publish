import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

export const routes = {
    profile: {
        name: "settings.profile",
        path: "/settings/profile",
    },
    password: {
        name: "settings.password",
        path: "/settings/password",
    },
    appearance: {
        name: "settings.appearance",
        path: "/settings/appearance",
    },
    connections: {
        name: "settings.connections",
        path: "/settings/connections",
    },
    billing: {
        name: "settings.billing",
        path: "/settings/billing",
    },
    // Redirect /settings to /settings/profile
    index: {
        name: "settings.index",
        path: "/settings",
    },
} as const;

export const settingsRoutes: RouteObject[] = [
    {
        path: routes.profile.path,
        lazy: async () => ({
            Component: (await import("@/pages/settings/Profile")).default,
        }),
    },
    {
        path: routes.password.path,
        lazy: async () => ({
            Component: (await import("@/pages/settings/Password")).default,
        }),
    },
    {
        path: routes.appearance.path,
        lazy: async () => ({
            Component: (await import("@/pages/settings/Appearance")).default,
        }),
    },
    {
        path: routes.connections.path,
        lazy: async () => ({
            Component: (await import("@/pages/settings/Connections")).default,
        }),
    },
    {
        path: routes.billing.path,
        lazy: async () => ({
            Component: (await import("@/pages/settings/Billing")).default,
        }),
    },
    // Redirect /settings to /settings/profile
    {
        path: routes.index.path,
        element: <Navigate to="/settings/profile" replace />,
    },
];
