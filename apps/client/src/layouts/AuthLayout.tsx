import * as React from "react";
import { AppLogo } from "@/components/AppLogo";
import { Badge } from "@/components/ui/core";

interface Props {
    title?: string;
    description?: string;
    children: React.ReactNode;
}

export const AuthLayout: React.FC<Props> = ({
    title,
    description,
    children,
}) => {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 font-medium">
                            <AppLogo />

                            <Badge
                                variant="outline"
                                className="text-[9px] font-mono py-0 px-2 rounded-full border-border text-muted-foreground bg-muted"
                            >
                                v0.1.0 - PRE-ALPHA
                            </Badge>
                        </div>
                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
