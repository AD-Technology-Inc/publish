import * as React from "react";
import { Link } from "react-router-dom";
import type { BreadcrumbItemType } from "@/types";
import { ChevronRight } from "lucide-react";

export const Breadcrumbs: React.FC<{ breadcrumbs: BreadcrumbItemType[] }> = ({
    breadcrumbs,
}) => {
    return (
        <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2">
                {breadcrumbs.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && (
                            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/40 mx-1 scale-75" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            {index === breadcrumbs.length - 1 ? (
                                <span className="text-foreground">
                                    {item.title}
                                </span>
                            ) : (
                                <Link
                                    to={item.href}
                                    className="text-muted-foreground/60 hover:text-primary transition-colors"
                                >
                                    {item.title}
                                </Link>
                            )}
                        </span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};
