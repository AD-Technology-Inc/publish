import React, { useState } from "react";
import {
    useRouteError,
    isRouteErrorResponse,
    Link,
    useNavigate,
} from "react-router-dom";
import {
    AlertTriangle,
    RefreshCw,
    Home,
    ArrowLeft,
    Copy,
    Check,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    FileQuestion,
    ServerCrash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLogo } from "@/components/AppLogo";

interface ErrorDetails {
    status?: number;
    statusText?: string;
    title: string;
    description: string;
    message?: string;
    stack?: string;
    data?: unknown;
}

function parseError(error: unknown): ErrorDetails {
    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return {
                status: 404,
                statusText: error.statusText || "Not Found",
                title: "Page Not Found",
                description:
                    "Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.",
                message: typeof error.data === "string" ? error.data : error.statusText,
                data: error.data,
            };
        }

        if (error.status === 401 || error.status === 403) {
            return {
                status: error.status,
                statusText: error.statusText || "Forbidden",
                title: error.status === 401 ? "Unauthorized Access" : "Access Forbidden",
                description:
                    "You don't have permission to view or interact with this resource. Please log in or check your credentials.",
                message: typeof error.data === "string" ? error.data : error.statusText,
                data: error.data,
            };
        }

        return {
            status: error.status,
            statusText: error.statusText || "Application Error",
            title: "Application Error",
            description:
                "An unexpected response was returned while loading this page.",
            message: typeof error.data === "string" ? error.data : JSON.stringify(error.data),
            data: error.data,
        };
    }

    if (error instanceof Error) {
        return {
            status: 500,
            statusText: "Runtime Error",
            title: "Something Went Wrong",
            description:
                "An unexpected application error occurred while processing your request.",
            message: error.message,
            stack: error.stack,
        };
    }

    if (typeof error === "string") {
        return {
            status: 500,
            statusText: "Error",
            title: "Something Went Wrong",
            description:
                "An unexpected error occurred while processing your request.",
            message: error,
        };
    }

    return {
        status: 500,
        statusText: "Unknown Error",
        title: "Unexpected Error",
        description:
            "An unknown error occurred. Please try reloading the page or contacting support if the problem persists.",
        data: error,
    };
}

export const ErrorBoundaryView: React.FC<{
    error?: unknown;
    resetError?: () => void;
}> = ({ error, resetError }) => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const errorDetails = parseError(error);

    const handleCopyDetails = async () => {
        const payload = JSON.stringify(
            {
                status: errorDetails.status,
                statusText: errorDetails.statusText,
                title: errorDetails.title,
                message: errorDetails.message,
                stack: errorDetails.stack,
                data: errorDetails.data,
                url: window.location.href,
                timestamp: new Date().toISOString(),
            },
            null,
            2
        );

        try {
            await navigator.clipboard.writeText(payload);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard fallback
        }
    };

    const handleReload = () => {
        if (resetError) {
            resetError();
        } else {
            window.location.reload();
        }
    };

    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/dashboard");
        }
    };

    const getIcon = () => {
        if (errorDetails.status === 404) {
            return <FileQuestion className="h-10 w-10 text-amber-500" />;
        }
        if (errorDetails.status === 401 || errorDetails.status === 403) {
            return <ShieldAlert className="h-10 w-10 text-amber-500" />;
        }
        if (errorDetails.status && errorDetails.status >= 500) {
            return <ServerCrash className="h-10 w-10 text-red-500" />;
        }
        return <AlertTriangle className="h-10 w-10 text-red-500" />;
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-xl relative z-10 space-y-6 text-center">
                {/* Brand */}
                <div className="flex justify-center">
                    <AppLogo />
                </div>

                {/* Error Card */}
                <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6 text-left">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-muted/60 border border-border/50 rounded-xl shrink-0">
                            {getIcon()}
                        </div>
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                    {errorDetails.title}
                                </h1>
                                {errorDetails.status && (
                                    <Badge variant={errorDetails.status === 404 ? "warning" : "danger"}>
                                        {errorDetails.status} {errorDetails.statusText}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {errorDetails.description}
                            </p>
                        </div>
                    </div>

                    {/* Inline Error Message */}
                    {errorDetails.message && (
                        <div className="bg-muted/40 border border-border/60 rounded-lg p-3 text-xs font-mono text-muted-foreground break-all">
                            <span className="text-red-400 font-semibold select-none">Error: </span>
                            {errorDetails.message}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                        <Button
                            variant="default"
                            onClick={handleReload}
                            className="flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Try Again</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center justify-center gap-2"
                        >
                            <Home className="h-4 w-4" />
                            <span>Dashboard</span>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={handleGoBack}
                            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Go Back</span>
                        </Button>
                    </div>

                    {/* Collapsible Technical Details */}
                    {(errorDetails.stack || errorDetails.data !== undefined) && (
                        <div className="border-t border-border/60 pt-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    {showDetails ? (
                                        <ChevronUp className="h-3.5 w-3.5" />
                                    ) : (
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    )}
                                    <span>{showDetails ? "Hide" : "Show"} diagnostics</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCopyDetails}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 text-green-500" />
                                            <span className="text-green-500">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />
                                            <span>Copy details</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {showDetails && (
                                <pre className="bg-black/40 border border-border/40 rounded-lg p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-60 leading-relaxed whitespace-pre-wrap">
                                    {errorDetails.stack ||
                                        (typeof errorDetails.data === "string"
                                            ? errorDetails.data
                                            : JSON.stringify(errorDetails.data, null, 2))}
                                </pre>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <p className="text-xs text-muted-foreground/80">
                    If this error persists, please refresh your session or return to the{" "}
                    <Link to="/" className="text-primary hover:underline font-medium">
                        home page
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
};

/**
 * Route-level Error Boundary for React Router v6 / v7
 */
export const ErrorBoundary: React.FC = () => {
    const error = useRouteError();
    return <ErrorBoundaryView error={error} />;
};

/**
 * Class-based Error Boundary for component subtrees
 */
interface Props {
    children?: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ComponentErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught component error:", error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <ErrorBoundaryView
                    error={this.state.error}
                    resetError={this.resetError}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
