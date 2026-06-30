import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input, Label, Checkbox, Card, CardContent } from '@/components/ui/core';
// import { Chrome } from 'lucide-react';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <AuthLayout 
            title="Log in to your account" 
            description="Enter your email below to login to your account"
        >
            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Card className="border-border shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden bg-card">
                    <CardContent className="p-8 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Email Address</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        placeholder="name@example.com" 
                                        required 
                                        className="h-11 rounded-xl border-border bg-muted/20 focus-visible:ring-accent/20 px-4"
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <div className="flex items-center justify-between px-1">
                                        <Label htmlFor="password" title="Password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Password</Label>
                                        <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">Forgot?</Link>
                                    </div>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        required 
                                        className="h-11 rounded-xl border-border bg-muted/20 focus-visible:ring-accent/20 px-4"
                                    />
                                </div>
                                <div className="flex items-center space-x-2 px-1">
                                    <Checkbox id="remember" className="rounded-md" />
                                    <Label htmlFor="remember" className="text-xs font-medium text-muted-foreground cursor-pointer">Remember me for 30 days</Label>
                                </div>
                            </div>
                            <Button 
                                type="submit" 
                                variant="accent"
                                className="w-full h-12 rounded-xl font-bold shadow-lg shadow-accent/15 transition-all hover:scale-[1.02] active:scale-95 border-0 mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Authenticating...' : 'Sign In'}
                            </Button>
                        </form>
 
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-4 text-[10px] font-black text-muted-foreground/40 tracking-widest">Or continue with</span>
                            </div>
                        </div>
 
                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-border bg-background shadow-xs hover:bg-muted transition-all">
                            {/* <Chrome className="mr-2 h-4 w-4" />  */}
                            Google
                        </Button>
                    </CardContent>
                </Card>
 
                <p className="text-center text-xs text-muted-foreground font-medium">
                    New to AD. Publish?{' '}
                    <Link to="/register" className="font-black text-accent hover:underline">
                        Create an account
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Login;
