import { cn } from "@/lib/utils";
import React from "react";

interface AppLogoIconProps extends React.SVGProps<SVGSVGElement> {}

export const AppLogoIcon: React.FC<AppLogoIconProps> = ({
    className,
    ...props
}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
            className={cn("size-6", className)}
            {...props}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
            />
        </svg>
    );
};

export const AppLogo: React.FC = () => {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center text-foreground">
                <AppLogoIcon className="size-5" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-foreground">
                    AD. Publish
                </span>
            </div>
        </>
    );
};
