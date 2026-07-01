import * as React from "react";
import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { Button, Badge } from "@/components/ui/core";

export const Pricing: React.FC = () => {
    return (
        <section
            id="pricing"
            className="border-t border-border bg-[#070708] py-20 text-left"
        >
            <div className="max-w-7xl mx-auto px-6 space-y-20">
                {/* Section Header */}
                <div className="max-w-3xl space-y-4">
                    <Badge
                        variant="outline"
                        className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-border/60 text-primary bg-card"
                    >
                        Pricing & Plans
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                        Transparent plans for any scale
                    </h2>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                        Choose our managed cloud service for a
                        hassle-free deployment, or host the open-source
                        core codebase on your own infrastructure.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Starter Plan */}
                    <div className="rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md p-8 flex flex-col justify-between hover:border-primary/20 transition-all duration-500 hover:shadow-lg relative group">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                                    Starter
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline text-foreground">
                                    <span className="text-4xl md:text-5xl font-black tracking-tighter">
                                        $0
                                    </span>
                                    <span className="text-xs text-muted-foreground font-bold italic opacity-40 ml-1">
                                        /month
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                    Perfect for exploring the platform
                                    and personal use.
                                </p>
                            </div>

                            <div className="h-px bg-border/40 w-full" />

                            <ul className="space-y-4">
                                {[
                                    "3 Social Profiles",
                                    "10 Posts / Month",
                                    "Basic Analytics",
                                    "Standard Support",
                                ].map((feat, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-3 text-xs text-foreground/80 font-medium"
                                    >
                                        <div className="p-0.5 rounded-full bg-primary/10 text-primary mt-0.5 shadow-inner">
                                            <Check className="w-3 h-3 stroke-[3px]" />
                                        </div>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="pt-8">
                            <Link to="/register">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
                                >
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Pro Plan (Featured) */}
                    <div className="rounded-[2.5rem] border border-primary bg-primary/[0.02] backdrop-blur-md p-8 flex flex-col justify-between shadow-xl shadow-primary/[0.03] hover:shadow-primary/[0.08] transition-all duration-500 hover:-translate-y-1 relative group ring-1 ring-primary">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700"></div>
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                    Pro Plan
                                </span>
                                <Badge
                                    variant="success"
                                    className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest rounded-full px-2.5 py-0.5"
                                >
                                    <Star className="w-2.5 h-2.5 mr-1 fill-primary text-primary" />{" "}
                                    Popular
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline text-foreground">
                                    <span className="text-4xl md:text-5xl font-black tracking-tighter">
                                        $29
                                    </span>
                                    <span className="text-xs text-primary font-bold italic opacity-60 ml-1">
                                        /month
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                    Ideal for growing businesses and
                                    social media managers.
                                </p>
                            </div>

                            <div className="h-px bg-primary/20 w-full" />

                            <ul className="space-y-4">
                                {[
                                    "10 Social Profiles",
                                    "Unlimited Posts",
                                    "Advanced Analytics",
                                    "Priority Support",
                                    "Team Collaboration",
                                ].map((feat, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-3 text-xs text-foreground font-semibold"
                                    >
                                        <div className="p-0.5 rounded-full bg-primary text-primary-foreground mt-0.5 shadow-md shadow-primary/20">
                                            <Check className="w-3 h-3 stroke-[3px]" />
                                        </div>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="pt-8 relative z-10">
                            <Link to="/register">
                                <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-lg shadow-primary/15">
                                    Start Free Trial
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md p-8 flex flex-col justify-between hover:border-primary/20 transition-all duration-500 hover:shadow-lg relative group">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                                    Enterprise
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline text-foreground">
                                    <span className="text-4xl md:text-5xl font-black tracking-tighter">
                                        $99
                                    </span>
                                    <span className="text-xs text-muted-foreground font-bold italic opacity-40 ml-1">
                                        /month
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                    Complete solution for large agencies
                                    and corporations.
                                </p>
                            </div>

                            <div className="h-px bg-border/40 w-full" />

                            <ul className="space-y-4">
                                {[
                                    "Unlimited everything",
                                    "Custom Reporting",
                                    "Dedicated Manager",
                                    "API Access",
                                    "SSO integration",
                                ].map((feat, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-3 text-xs text-foreground/80 font-medium"
                                    >
                                        <div className="p-0.5 rounded-full bg-primary/10 text-primary mt-0.5 shadow-inner">
                                            <Check className="w-3 h-3 stroke-[3px]" />
                                        </div>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="pt-8">
                            <Link to="/register">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
                                >
                                    Contact Sales
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
