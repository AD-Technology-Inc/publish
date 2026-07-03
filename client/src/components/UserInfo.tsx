import * as React from 'react';
import type { User } from '@/types';
import { getInitials } from '@/lib/initials';

interface Props {
    user: User;
    showEmail?: boolean;
}

export const UserInfo: React.FC<Props> = ({ user, showEmail = false }) => {
    const showAvatar = user.avatar && user.avatar !== '';

    return (
        <div className="flex items-center">
            <div className="h-8 w-8 overflow-hidden rounded-full border border-border/50 shadow-sm bg-muted flex items-center justify-center shrink-0">
                {showAvatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                    <span className="font-black text-[10px] text-foreground">
                        {getInitials(user.name)}
                    </span>
                )}
            </div>

            <div className="grid flex-1 text-left text-[11px] leading-tight ml-2 overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="truncate font-black uppercase tracking-widest text-foreground">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                        {user.email}
                    </span>
                )}
            </div>
        </div>
    );
};
