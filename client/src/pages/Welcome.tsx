import * as React from "react";
import { Link } from "react-router-dom";
import { useTitle } from "@/hooks/use-title";
import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InteractiveSimulator } from "@/components/InteractiveSimulator";

import { Hero } from "./welcome/Hero";
import { Problem } from "./welcome/Problem";
import { Solution } from "./welcome/Solution";
import { Features } from "./welcome/Features";
import { Timeline } from "./welcome/Timeline";
import { Guarantees } from "./welcome/Guarantees";
import { Architecture } from "./welcome/Architecture";
import { DeepDive } from "./welcome/DeepDive";
import { TechStack } from "./welcome/TechStack";
import { Pricing } from "./welcome/Pricing";
import { Faq } from "./welcome/Faq";
import { Deployment } from "./welcome/Deployment";

export const Welcome: React.FC = () => {
    useTitle("Distributed Publishing Platform");

    return (
        <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AppLogo />
                        <Badge
                            variant="outline"
                            className="text-[9px] font-mono py-0 px-2 rounded-full text-accent border-accent/80"
                        >
                            v0.1.0 - PRE-ALPHA
                        </Badge>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        <a
                            href="#features"
                            className="hover:text-foreground transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#interactive-simulator"
                            className="hover:text-foreground transition-colors"
                        >
                            Simulator
                        </a>
                        <a
                            href="#reliability-guarantees"
                            className="hover:text-foreground transition-colors"
                        >
                            Guarantees
                        </a>
                        <a
                            href="#under-the-hood"
                            className="hover:text-foreground transition-colors"
                        >
                            Architecture
                        </a>
                        <a
                            href="#engineering-deep-dive"
                            className="hover:text-foreground transition-colors"
                        >
                            Deep Dive
                        </a>
                        <a
                            href="#pricing-roadmap"
                            className="hover:text-foreground transition-colors"
                        >
                            FAQ
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            <Button
                                variant="ghost"
                                className="font-bold text-[11px] uppercase tracking-widest px-4 h-9"
                            >
                                Log in
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button className="font-black rounded-lg text-[11px] uppercase tracking-widest px-5 h-9 shadow-sm shadow-primary/15">
                                Launch App
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-24">
                <Hero />
                <Problem />
                <Solution />
                <Features />
                <Timeline />
                <InteractiveSimulator />
                <Guarantees />
                <Architecture />
                <DeepDive />
                <TechStack />
                <Pricing />
                <Faq />
                <Deployment />
            </main>

            {/* FOOTER */}
            <footer className="border-t border-border bg-muted/40 py-16 text-left">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <AppLogo />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium max-w-xs leading-relaxed">
                            A production-grade distributed publishing system
                            built to study coordination primitives and
                            failure-safe architectures.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                            System Nodes
                        </h3>
                        <ul className="space-y-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <li>
                                <a
                                    href="#under-the-hood"
                                    className="hover:text-foreground transition-colors"
                                >
                                    FastAPI Gateway
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#under-the-hood"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Redis Streams Broker
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#under-the-hood"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Social publish worker
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#under-the-hood"
                                    className="hover:text-foreground transition-colors"
                                >
                                    PostgreSQL Persistence
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                            Engineering Resources
                        </h3>
                        <ul className="space-y-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <li>
                                <a
                                    href="https://github.com/zerexei/posexei"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                >
                                    GitHub Repository
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#engineering-deep-dive"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Technical tradeoffs
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#reliability-guarantees"
                                    className="hover:text-foreground transition-colors"
                                >
                                    System guarantees
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#interactive-simulator"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Chaos Simulator
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[9px] text-muted-foreground">
                    <p>
                        © 2026 AD. Publish. All rights reserved. Codebase
                        licensed under the MIT License.
                    </p>
                    <div className="flex items-center gap-6">
                        <a
                            href="https://github.com/zerexei/posexei"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="#pricing-roadmap"
                            className="hover:text-foreground transition-colors"
                        >
                            Developer FAQ
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;
