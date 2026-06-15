import * as React from "react";
import { useLocation, Link } from "react-router-dom";
import { Heading } from "@/components/Heading";
import { Button, Separator } from "@/components/ui/core";
import { cn } from "@/lib/utils";

interface NavItem {
    title: string;
    href: string;
}

const sidebarNavItems: NavItem[] = [
    { title: "Profile", href: "/settings/profile" },
    { title: "Password", href: "/settings/password" },
    { title: "Appearance", href: "/settings/appearance" },
    { title: "Connections", href: "/settings/connections" },
    { title: "Billing", href: "/settings/billing" },
];

export const SettingsLayout: React.FC<{
    children: React.ReactNode;
    size?: "sm" | "md";
}> = ({ size = "sm", children }) => {
    const location = useLocation();

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1">
                        {sidebarNavItems.map((item) => (
                            <Link key={item.href} to={item.href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start rounded-xl",
                                        location.pathname === item.href
                                            ? "bg-muted"
                                            : "",
                                    )}
                                >
                                    {item.title}
                                </Button>
                            </Link>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div
                    className={`flex-1 ${size == "md" ? "max-w-4xl" : "md:max-w-2xl"} text-left`}
                >
                    <section className=" space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
};
