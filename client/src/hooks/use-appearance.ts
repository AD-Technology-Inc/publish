import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

export function updateTheme(value: Appearance) {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;

    if (value === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.toggle('dark', systemTheme === 'dark');
    } else {
        root.classList.toggle('dark', value === 'dark');
    }
}

export function initializeTheme() {
    if (typeof window === 'undefined') return;

    const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
    updateTheme(savedAppearance || 'system');

    // Listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
        const currentAppearance = localStorage.getItem('appearance') as Appearance | null;
        updateTheme(currentAppearance || 'system');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('appearance') as Appearance) || 'system';
        }
        return 'system';
    });

    const updateAppearance = (value: Appearance) => {
        setAppearance(value);
        localStorage.setItem('appearance', value);
        updateTheme(value);
    };

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        if (savedAppearance) {
            setAppearance(savedAppearance);
        }
    }, []);

    return {
        appearance,
        updateAppearance,
    };
}
