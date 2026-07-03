import type { LucideIcon } from 'lucide-react';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
    isActive?: boolean;
}

export interface Subscription {
    plan: string;
    status: string;
    days_remaining: number;
    renews_at: string;
    is_trial: boolean;
}

export interface Connection {
    id: number;
    provider: 'facebook' | 'linkedin' | 'twitter' | 'instagram';
    name: string;
}

export interface UpcomingPost {
    id: number;
    title: string;
    platforms: string[];
    date: string;
}

export interface LatestPost {
    id: number;
    title: string;
    platforms: string[];
    date: string;
    status: string;
}

export interface Stats {
    posts_this_month: number;
    monthly_target: number;
}

export type BreadcrumbItemType = BreadcrumbItem;
