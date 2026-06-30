import React from "react";
import { Link } from "react-router-dom";

const routes = {
    home: {
        path: "/",
    },
};

export const AppLogo: React.FC = () => {
    return (
        <Link to={routes.home.path} className="text-lg font-bold tracking-tighter">
            AD<span className="text-accent">.</span>
        </Link>
    );
};
