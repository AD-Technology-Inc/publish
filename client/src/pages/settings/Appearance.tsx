import * as React from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import { Heading } from '@/components/Heading';
import { useAppearance } from '@/hooks/use-appearance';
import type { Appearance as AppearanceType } from '@/hooks/use-appearance';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTitle } from '@/hooks/use-title';

const tabs = [
    { value: 'light', Icon: Sun, label: 'Light' },
    { value: 'dark', Icon: Moon, label: 'Dark' },
    { value: 'system', Icon: Monitor, label: 'System' },
] as const;

export const Appearance: React.FC = () => {
    useTitle('Appearance Settings');
    const { appearance, updateAppearance } = useAppearance();

    const breadcrumbs = [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Appearance', href: '/settings/appearance' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <div className="space-y-6 text-left">
                    <Heading 
                        title="Appearance" 
                        description="Update your account's appearance settings" 
                    />
                    
                    <div className="inline-flex gap-1 rounded-xl bg-muted p-1 border border-border/50">
                        {tabs.map(({ value, Icon, label }) => (
                            <button
                                key={value}
                                onClick={() => updateAppearance(value as AppearanceType)}
                                className={cn(
                                    'flex items-center rounded-lg px-4 py-2 transition-all duration-200 outline-none',
                                    appearance === value
                                        ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
                                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                )}
                            >
                                <Icon className={cn('h-4 w-4 shrink-0', appearance === value ? 'text-primary' : 'opacity-60')} />
                                <span className={cn('ml-2 text-xs font-black uppercase tracking-widest', appearance === value ? 'opacity-100' : 'opacity-60')}>{label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 opacity-40 grayscale pointer-events-none select-none">
                         <div className="space-y-3">
                             <div className="h-4 w-48 bg-muted rounded-full" />
                             <div className="h-32 w-full bg-muted rounded-2xl border border-border" />
                         </div>
                         <div className="space-y-3">
                             <div className="h-4 w-48 bg-muted rounded-full" />
                             <div className="h-32 w-full bg-muted rounded-2xl border border-border" />
                         </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
};

export default Appearance;
