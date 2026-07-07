import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const GithubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" {...props}>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"
        />
    </svg>
);

export const Hero: React.FC = () => {
    return (
        <>
            {/* HERO SECTION */}
            <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 text-center">
                {/* Glowing effect */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-muted rounded-full blur-[120px] pointer-events-none -z-10"></div>

                <div className="space-y-8 max-w-4xl mx-auto">
                    <Badge
                        variant="outline"
                        className="tracking-wide border-primary/80 text-primary"
                    >
                        Distributed Publishing Engine
                    </Badge>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground">
                        Reliable async publishing <br />
                        <span className="text-primary">
                            engineered for failure safety.
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
                        AD. Publish is a resilient publishing platform that
                        guarantees at-least-once delivery, application-level
                        idempotency, and automated crash recovery. Built on
                        FastAPI, Redis Streams, and PostgreSQL to coordinate
                        multi-stage publication workflows across multiple
                        services.
                    </p>

                    <div className="flex flex-col flex-wrap sm:flex-row items-center justify-center gap-4 pt-6">
                        <Link to="/register" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto rounded-lg h-12 px-8 text-xs font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/15"
                            >
                                Start Live Demo{" "}
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <a
                            href="https://github.com/AD-Technology-Inc/publish"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto rounded-lg h-12 px-8 text-xs font-black uppercase tracking-widest gap-2"
                            >
                                <GithubIcon /> GitHub Repository
                            </Button>
                        </a>
                        <a
                            href="#engineering-deep-dive"
                            className="w-full sm:w-auto"
                        >
                            <Button
                                size="lg"
                                variant="ghost"
                                className="w-full sm:w-auto rounded-lg h-12 px-8 text-xs font-black uppercase tracking-widest gap-2"
                            >
                                <BookOpen className="w-4 h-4" /> Engineering
                                Notes
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* CAPABILITY STRIP */}
            <section className="border-y border-border bg-muted/20 py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
                        {[
                            {
                                title: "At-Least-Once Delivery",
                                desc: "Deduplicated execution boundary via Redis lock.",
                            },
                            {
                                title: "Zero-Lease Contention",
                                desc: "Explicit worker leasing with visibility timeouts.",
                            },
                            {
                                title: "Fault-Isolated Streams",
                                desc: "Unrecoverable jobs route immediately to DLQ.",
                            },
                            {
                                title: "Resumable Checkpoints",
                                desc: "StateManager saves progress in isolated DBs.",
                            },
                        ].map((cap, i) => (
                            <div
                                key={i}
                                className="pt-6 md:pt-0 md:px-6 first:pt-0 first:pl-0 text-left space-y-1"
                            >
                                <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                                    {cap.title}
                                </h4>
                                <p className="text-xs text-muted-foreground font-medium">
                                    {cap.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};
