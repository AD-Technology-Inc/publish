import { Users, TrendingUp, BarChart2 } from 'lucide-react';
import type { User, Subscription, Connection, UpcomingPost, LatestPost, Stats } from '../types';

export const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://github.com/shadcn.png',
};

export const mockSubscription: Subscription = {
    plan: 'Pro',
    status: 'active',
    days_remaining: 24,
    renews_at: '2026-05-17',
    is_trial: false,
};

export const mockQuote = {
    message: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
};

export const mockConnections: Connection[] = [
    { id: 1, provider: 'facebook', name: 'Facebook Page' },
    { id: 2, provider: 'instagram', name: 'Instagram Biz' },
    { id: 3, provider: 'twitter', name: 'X Profile' },
    { id: 4, provider: 'linkedin', name: 'Professional Page' },
];

export const mockUpcoming: UpcomingPost[] = [
    { id: 1, title: 'Spring Collection Launch', platforms: ['instagram', 'facebook'], date: 'Mon, 10:00 AM' },
    { id: 2, title: 'Customer Success Story', platforms: ['twitter', 'linkedin'], date: 'Wed, 02:30 PM' },
];

export interface DetailedPost extends LatestPost {
    content: string;
    type: 'text' | 'image' | 'video';
    reach: string;
    engagement: string;
    created_at: string;
}

export const mockPosts: DetailedPost[] = [
    { 
        id: 1, 
        title: 'New Feature Announcement', 
        platforms: ['facebook', 'twitter', 'linkedin'], 
        date: '2 hours ago', 
        status: 'published',
        content: 'We are thrilled to announce our latest features that will revolutionize how you manage your social media...',
        type: 'image',
        reach: '12.4k',
        engagement: '4.2%',
        created_at: 'Feb 15, 2026'
    },
    { 
        id: 2, 
        title: 'Weekend Vibes', 
        platforms: ['instagram'], 
        date: '5 hours ago', 
        status: 'published',
        content: 'Enjoying the sunset and getting ready for an amazing week ahead! #socialmedia #growth',
        type: 'image',
        reach: '8.1k',
        engagement: '5.8%',
        created_at: 'Feb 14, 2026'
    },
    { 
        id: 3, 
        title: 'Behind the Scenes', 
        platforms: ['instagram', 'facebook'], 
        date: 'Yesterday', 
        status: 'published',
        content: 'Take a look at how we build our products. Direct from our headquarters!',
        type: 'video',
        reach: '24.5k',
        engagement: '3.1%',
        created_at: 'Feb 13, 2026'
    },
    { 
        id: 4, 
        title: 'Productivity Tips', 
        platforms: ['twitter', 'linkedin'], 
        date: 'Scheduled', 
        status: 'scheduled',
        content: 'How to stay productive in a remote world. Here are 5 tips you can use today.',
        type: 'text',
        reach: '0',
        engagement: '0%',
        created_at: 'Feb 15, 2026'
    },
];

export const mockLatestPosts: LatestPost[] = mockPosts.slice(0, 3);

export const mockStats: Stats = {
    posts_this_month: 12,
    monthly_target: 20,
};

export const mockDashboardStats = [
    { label: 'Total Reach', value: '82.1k', change: '+12.3%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Engagement', value: '4.2%', change: '+0.5%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Impressions', value: '124.5k', change: '+18.2%', icon: BarChart2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export const mockRecentActivities = [
    { id: 1, title: 'New Product Launch Visual', platform: 'instagram', time: '2 hours ago' },
    { id: 2, title: 'Community Feedback Loop', platform: 'facebook', time: '5 hours ago' },
    { id: 3, title: 'Weekly Recap Newsletter', platform: 'twitter', time: 'Yesterday' },
];
