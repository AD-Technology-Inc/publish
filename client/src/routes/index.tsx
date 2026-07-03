import { createBrowserRouter, Navigate } from "react-router-dom";

import { authRoutes } from "@/routes/auth";
import { postsRoutes } from "@/routes/posts";
import { settingsRoutes } from "@/routes/settings";

import Welcome from "@/pages/Welcome";

export const router = createBrowserRouter([
    {
        hydrateFallbackElement: (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                Loading...
            </div>
        ),
        children: [
            {
                path: "/",
                element: <Welcome />,
            },
            ...authRoutes,
            {
                path: "/dashboard",
                lazy: async () => {
                    const Dashboard = await import("@/pages/Dashboard");
                    return { Component: Dashboard.default };
                },
            },
            ...postsRoutes,
            ...settingsRoutes,
            {
                path: "*",
                element: <Navigate to="/" replace />,
            },
        ],
    },
], {
    basename: import.meta.env.BASE_URL,
});
