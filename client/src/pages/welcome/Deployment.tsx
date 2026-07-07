import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Check, Copy } from "lucide-react";
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

export const Deployment: React.FC = () => {
    const [copied, setCopied] = React.useState<boolean>(false);
    const handleCopy = () => {
        navigator.clipboard.writeText("docker compose up --build -d");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="max-w-7xl mx-auto px-6 py-20">
            <div className="relative rounded-[2.5rem] border border-border bg-card/45 backdrop-blur-md overflow-hidden p-12 md:p-20 text-center space-y-8 shadow-2xl hover:border-primary/20 transition-all duration-700 group">
                {/* Glow details */}
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-all duration-700"></div>
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-all duration-700"></div>

                <div className="space-y-4 relative z-10 max-w-3xl mx-auto">
                    <Badge
                        variant="outline"
                        className="rounded-full py-0.5 px-3 text-[9px] font-mono uppercase tracking-widest border-primary/25 text-primary bg-primary/5"
                    >
                        Deployment
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
                        Launch the cluster in your environment
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
                        Run the complete microservices stack locally with docker compose. Telemetry, Postgres tables,
                        and worker processes initialize automatically.
                    </p>
                </div>

                {/* Interactive terminal command copy block */}
                <div
                    onClick={handleCopy}
                    className="max-w-md mx-auto p-4 rounded-xl bg-zinc-950/60 hover:bg-zinc-950 text-foreground border border-border/60 hover:border-primary/30 font-mono text-xs flex items-center justify-between shadow-2xl relative z-10 cursor-pointer transition-all duration-300 group/term"
                >
                    <div className="flex items-center gap-2.5">
                        <span className="text-primary font-bold">$</span>
                        <span className="text-muted-foreground group-hover/term:text-foreground transition-colors select-all">
                            docker compose up --build -d
                        </span>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2.5 rounded-md text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 hover:bg-background/80"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-primary" />
                                <span className="text-primary">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover/term:text-foreground transition-colors" />
                                <span>Copy</span>
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-4">
                    <Link to="/register" className="w-full sm:w-auto">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto rounded-lg h-12 px-8 text-xs font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/15"
                        >
                            Launch Console <ChevronRight className="w-4 h-4 stroke-[3px]" />
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
                            className="w-full sm:w-auto rounded-lg h-12 px-8 text-xs font-black uppercase tracking-widest gap-2 hover:bg-muted"
                        >
                            <GithubIcon /> GitHub Repository
                        </Button>
                    </a>
                </div>
            </div>
        </section>
    );
};
