import * as React from 'react';
import { Link } from 'react-router-dom';
import { 
    BarChart3, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    Share2, 
    Target, 
    TrendingUp, 
    ChevronRight,
    Play
} from 'lucide-react';
import { Instagram, Facebook, Twitter, Linkedin } from '@/components/SocialIcons';
import { useTitle } from '@/hooks/use-title';

import { AppLogoIcon } from '@/components/AppLogo';
import { Button, Badge } from '@/components/ui/core';
import { cn } from '@/lib/utils';

const platforms = [
    { name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/30' },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { name: 'Twitter', icon: Twitter, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/30' },
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
];

const features = [
    {
        title: 'Smart Scheduling',
        description: 'Plan your content ahead and let Posexei handle the publishing across all your channels.',
        icon: Calendar,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        title: 'Actionable Insights',
        description: 'Understand your audience with deep analytics and engagement trends for every post.',
        icon: BarChart3,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
    {
        title: 'Goal Tracking',
        description: 'Set monthly targets and track your progress to stay consistent with your strategy.',
        icon: Target,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    },
    {
        title: 'Unified Inbox',
        description: 'Manage all your social interactions from one central dashboard without switching tabs.',
        icon: Share2,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10'
    }
];

export const Welcome: React.FC = () => {
    useTitle('Master Your Social Presence');

    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a] text-foreground font-sans selection:bg-primary/20">
            {/* Navigation */}
            <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg p-2 bg-primary">
                            <AppLogoIcon className="size-4 fill-current text-primary-foreground" />
                        </div>
                        <span className="text-lg font-black tracking-tight">Posexei</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#platforms" className="hover:text-primary transition-colors">Platforms</a>
                        <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            <Button variant="ghost" className="font-bold rounded-xl text-xs uppercase tracking-widest px-6 h-10">Log in</Button>
                        </Link>
                        <Link to="/register">
                            <Button className="font-black rounded-xl text-xs uppercase tracking-widest px-6 h-10 shadow-lg shadow-primary/20">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-20">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 text-center space-y-12">
                    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Badge variant="outline" className="rounded-full py-1.5 px-4 text-[10px] font-black uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/5 shadow-none">
                            Now in Early Access
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] text-foreground">
                            Master your <span className="text-primary italic">social presence</span> in one place.
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                            Connect all your channels, schedule content with ease, and grow your audience with data-driven insights. 
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto rounded-2xl h-14 px-10 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30 gap-2">
                                    Start Scheduling <ChevronRight className="w-4 h-4 stroke-[3px]" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-2xl h-14 px-10 text-sm font-black uppercase tracking-widest gap-2 bg-background/50 border-border">
                                <Play className="w-3.5 h-3.5 fill-current" /> Watch Demo
                            </Button>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="relative pt-10 group max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-300">
                        <div className="absolute inset-0 -top-20 -bottom-20 bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
                        <div className="relative rounded-[2.5rem] border border-border/50 bg-card p-4 md:p-6 shadow-2xl overflow-hidden ring-1 ring-border/20">
                            {/* Mockup Sidebar */}
                            <div className="absolute left-6 top-6 bottom-6 w-16 hidden lg:flex flex-col items-center py-6 gap-6 bg-muted/30 rounded-3xl border border-border/50">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center p-2 bg-primary">
                                    <AppLogoIcon className="size-4 fill-current text-primary-foreground" />
                                </div>
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-8 h-8 rounded-xl bg-border/40"></div>
                                ))}
                            </div>

                            {/* Mockup Main Content */}
                            <div className="lg:pl-24 space-y-6 text-left">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
                                    <div className="text-left">
                                        <div className="h-6 w-48 bg-muted rounded-lg mb-2"></div>
                                        <div className="flex gap-2">
                                            {platforms.map((p) => (
                                                <div key={p.name} className={cn('w-6 h-6 rounded-full', p.bg)}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-10 w-32 bg-primary/20 rounded-xl border border-primary/20"></div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="p-6 rounded-[2rem] border border-border/50 bg-muted/20">
                                            <div className="w-10 h-10 rounded-2xl bg-background border border-border mb-4"></div>
                                            <div className="h-6 w-24 bg-foreground/10 rounded-lg mb-2"></div>
                                            <div className="h-4 w-16 bg-muted-foreground/10 rounded-lg"></div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8 rounded-[2rem] border border-border/50 bg-muted/10 h-[240px] flex items-end gap-3 px-6">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="flex-1 bg-primary/10 rounded-t-xl" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof / Platforms */}
                <section id="platforms" className="max-w-7xl mx-auto px-6 py-20 mt-10 text-center">
                    <div className="space-y-4 mb-12">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Supported Platforms</h2>
                        <p className="text-2xl font-black text-foreground">Sync everything in seconds</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-60">
                        {platforms.map((p) => {
                            const Icon = p.icon;
                            return (
                                <div key={p.name} className="flex items-center gap-3 group grayscale hover:grayscale-0 transition-all duration-500 cursor-default font-sans">
                                    <div className={cn('p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-sm', p.bg)}>
                                        <Icon className={cn('w-6 h-6', p.color)} />
                                    </div>
                                    <span className="text-sm font-black tracking-widest uppercase">{p.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8 text-left">
                            <div className="space-y-4">
                                <Badge variant="outline" className="rounded-full py-1 px-4 text-[9px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-600 bg-emerald-500/5 shadow-none">
                                    Powerful Automation
                                </Badge>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">Built for teams who want to <span className="text-primary italic">scale</span>.</h2>
                                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                                    Manage multiple accounts, collaborate with your team, and never miss a peak engagement window again. Posexei is designed for modern social media managers.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {features.map((feature) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div key={feature.title} className="space-y-3 p-2 group text-left">
                                            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg', feature.bg)}>
                                                <Icon className={cn('w-6 h-6', feature.color)} />
                                            </div>
                                            <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground font-medium leading-relaxed opacity-80">{feature.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full opacity-30"></div>
                            <div className="relative space-y-4">
                                {/* Feature Highlight Card 1 */}
                                <div className="p-6 rounded-[2rem] border border-border/50 bg-card shadow-xl ml-auto max-w-xs animate-in slide-in-from-right-8 duration-700">
                                    <div className="flex items-center gap-4 mb-4 text-left">
                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-foreground">Growth Streak</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[78%]"></div>
                                    </div>
                                    <p className="text-[11px] font-bold text-muted-foreground mt-3 uppercase tracking-widest text-left">+12.4% THIS WEEK</p>
                                </div>

                                {/* Feature Highlight Card 2 */}
                                <div className="p-8 rounded-[2rem] border border-border/50 bg-primary text-primary-foreground shadow-2xl relative z-10 -mt-6 text-left">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Next Post</p>
                                            <h4 className="text-xl font-black">Summer Collection Launch</h4>
                                        </div>
                                        <Badge variant="outline" className="bg-white/10 border-white/20 text-white rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest">Scheduled</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-white/20"></div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                                            <Clock className="w-4 h-4" /> 2h 45m
                                        </div>
                                    </div>
                                </div>

                                {/* Feature Highlight Card 3 */}
                                <div className="p-6 rounded-[2rem] border border-border/50 bg-card shadow-xl max-w-xs animate-in slide-in-from-left-8 duration-700">
                                    <div className="flex items-center gap-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="w-2 h-2 rounded-full bg-primary/20"></div>
                                        ))}
                                        <div className="h-1 w-20 bg-muted rounded-full ml-auto"></div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <div className="h-4 w-full bg-muted rounded-lg"></div>
                                        <div className="h-4 w-2/3 bg-muted rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 text-center">
                    <div className="space-y-4 mb-16">
                        <Badge variant="outline" className="rounded-full py-1.5 px-4 text-[10px] font-black uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/5 shadow-none">
                            Simple Pricing
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">Plans for every <span className="text-primary italic">stage</span>.</h2>
                        <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
                            Whether you're just starting out or managing a global brand, we have a plan that fits your needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Plans */}
                        {[
                            { name: 'Free', price: '0', desc: 'Perfect for personal hobby projects.', features: ['1 Social Account', '10 Posts / Month', 'Basic Analytics', '7-Day History'] },
                            { name: 'Starter', price: '19', desc: 'For growing creators and small brands.', features: ['3 Social Accounts', 'Unlimited Posts', 'Growth Trends', '30-Day History', 'Custom Reports'] },
                            { name: 'Pro', price: '49', desc: 'Advanced tools for professional teams.', features: ['10 Social Accounts', 'Team Collaboration', 'Advanced Insights', '1-Year History', 'Priority Support', 'White-labeling'], popular: true },
                            { name: 'Business', price: '199', desc: 'Bespoke solutions for large organizations.', features: ['Unlimited Accounts', 'Dedicated Account Manager', 'Custom Integrations', 'API Access', 'SSO & Security', '24/7 Phone Support'] }
                        ].map((plan) => (
                            <div 
                                key={plan.name}
                                className={cn(
                                    "rounded-[2.5rem] border p-8 flex flex-col transition-all text-left",
                                    plan.popular ? "border-2 border-primary bg-card shadow-2xl shadow-primary/10 relative" : "border-border/50 bg-card hover:border-primary/20 ring-1 ring-border/20"
                                )}
                            >
                                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Most Popular</div>}
                                <div className="space-y-4 mb-8">
                                    <h3 className={cn("text-xs font-black uppercase tracking-widest", plan.popular ? "text-primary" : "text-muted-foreground")}>{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 text-foreground">
                                        <span className="text-4xl font-black tracking-tight">${plan.price}</span>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">/mo</span>
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">{plan.desc}</p>
                                </div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((feat) => (
                                        <li key={feat} className="flex items-center gap-3 text-xs font-bold text-foreground">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {feat}
                                        </li>
                                    ))}
                                </ul>
                                <div className="w-full">
                                    <Link to="/register">
                                        <Button variant={plan.popular ? "default" : "outline"} className={cn("w-full rounded-xl h-12 text-[10px] font-black uppercase tracking-widest", !plan.popular && "border-border hover:bg-muted")}>
                                            {plan.name === 'Business' ? 'Contact Sales' : 'Get Started'}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section id="cta" className="max-w-7xl mx-auto px-6 py-20">
                    <div className="relative rounded-[3rem] bg-foreground text-background overflow-hidden p-12 md:p-24 text-center space-y-10 group shadow-2xl">
                        <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/30 rounded-full blur-[100px] pointer-events-none"></div>
                        
                        <div className="space-y-6 relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Ready to take control of your <span className="text-primary underline decoration-4 underline-offset-8 decoration-primary/30">social game?</span></h2>
                            <p className="text-lg md:text-xl text-background/60 font-medium max-w-xl mx-auto text-center">
                                Join over 2,000+ creators and brands who trust Posexei to power their social media presence.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-4">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto rounded-2xl h-16 px-12 text-base font-black uppercase tracking-widest shadow-2xl shadow-primary/20 gap-3">
                                    Start Your Free Trial <ChevronRight className="w-5 h-5 stroke-[3.5px]" />
                                </Button>
                            </Link>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-background/40">No credit card required</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/40 bg-muted/20 py-20 text-left">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg p-2 bg-primary">
                                <AppLogoIcon className="size-4 fill-current text-primary-foreground" />
                            </div>
                            <span className="text-xl font-black tracking-tight uppercase tracking-widest">Posexei</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium max-w-xs leading-relaxed">
                            The modern social media management tool built for teams who want to scale their presence across all major platforms.
                        </p>
                        <div className="flex items-center gap-4">
                            {platforms.map((p) => {
                                const Icon = p.icon;
                                return (
                                    <div key={p.name} className="p-2 rounded-xl bg-muted border border-border/50 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Product</h3>
                        <ul className="space-y-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Company</h3>
                        <ul className="space-y-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 pt-20 mt-20 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-6 font-sans">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                        © 2026 Posexei Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                        <a href="#" className="hover:text-primary transition-colors">GitHub</a>
                        <a href="#" className="hover:text-primary transition-colors">Discord</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;
