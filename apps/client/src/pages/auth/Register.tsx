import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input, Label, Card, CardContent } from '@/components/ui/core';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate registration
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1200);
    };

    return (
        <AuthLayout 
            title="Create an account" 
            description="Enter your details below to create your account"
        >
            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-600">
                 <Card className="border-border shadow-2xl shadow-black/5 rounded-[2rem] overflow-hidden bg-card">
                    <CardContent className="p-8 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Full Name</Label>
                                    <Input 
                                        id="name" 
                                        type="text" 
                                        placeholder="John Doe" 
                                        required 
                                        className="h-11 rounded-xl border-border bg-muted/20 focus-visible:ring-accent/20 px-4"
                                    />
                                </div>
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
                                    <Label htmlFor="password" title="Password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Password</Label>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        required 
                                        className="h-11 rounded-xl border-border bg-muted/20 focus-visible:ring-accent/20 px-4"
                                    />
                                </div>
                            </div>
                            <Button 
                                type="submit" 
                                variant="accent"
                                className="w-full h-12 rounded-xl font-bold shadow-lg shadow-accent/15 transition-all hover:scale-[1.02] active:scale-95 border-0 mt-4"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Account...' : 'Continue'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
 
                <p className="px-8 text-center text-xs text-muted-foreground font-medium leading-relaxed">
                    By clicking continue, you agree to our{' '}
                    <Link to="#" className="font-black text-accent hover:underline">Terms of Service</Link>{' '}
                    and{' '}
                    <Link to="#" className="font-black text-accent hover:underline">Privacy Policy</Link>.
                </p>
 
                <p className="text-center text-xs text-muted-foreground font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="font-black text-accent hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Register;
