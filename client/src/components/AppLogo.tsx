import React from "react";
import { Link } from "react-router-dom";

const HOME = "/";

/**
 * AppLogoIcon — the compact mark only: "AD."
 * Use where space is tight (collapsed sidebar, favicon-adjacent contexts).
 */
export const AppLogoIcon: React.FC = () => {
    return (
        <span className="text-lg font-bold tracking-tighter leading-none">
            AD<span className="text-primary">.</span>
        </span>
    );
};

/**
 * AppLogo — full wordmark: "AD. Publish"
 * Use in headers, auth panels, and expanded sidebar contexts.
 */
export const AppLogo: React.FC = () => {
    return (
        <Link to={HOME} className="flex items-baseline gap-1 leading-none">
            <AppLogoIcon />
            <span className="text-lg font-bold tracking-tighter text-primary group-data-[collapsible=icon]:hidden">
                Publish
            </span>
        </Link>
    );
};
