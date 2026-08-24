import * as React from 'react';
import type { User } from '@/types';
import { getInitials } from '@/lib/initials';

interface Props {
    user: User;
    showEmail?: boolean;
}

export const UserInfo: React.FC<Props> = ({ user, showEmail = false }) => {
    const name = user?.name || '';
    const initials = getInitials(name);
    const showAvatar = Boolean(user?.avatar && user.avatar !== '');

    return (
        <div className="flex items-center">
            <div className="h-8 w-8 overflow-hidden rounded-full border border-border/60 shadow-sm bg-primary/10 flex items-center justify-center shrink-0">
                {showAvatar ? (
                    <img src={user.avatar} alt={name} className="h-full w-full object-cover" />
                ) : (
                    <span className="font-bold text-[11px] text-primary">
                        {initials}
                    </span>
                )}
            </div>

            <div className="grid flex-1 text-left text-[11px] leading-tight ml-2.5 overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold text-foreground">{name}</span>
                {showEmail && user?.email && (
                    <span className="truncate text-[10px] text-muted-foreground/70">
                        {user.email}
                    </span>
                )}
            </div>
        </div>
    );
};
