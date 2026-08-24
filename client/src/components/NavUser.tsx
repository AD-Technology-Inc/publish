import * as React from 'react';
import { UserInfo } from '@/components/UserInfo';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown, Settings, CreditCard, LogOut, Bell, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { identityApi } from '@/api/client';
import type { User } from '@/api/types';

export const NavUser: React.FC = () => {
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        identityApi.me().then(setUser).catch(() => setUser(null));
    }, []);

    if (!user) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="h-12 rounded-2xl transition-all hover:bg-muted data-[state=open]:bg-muted w-full cursor-pointer"
                        >
                            <UserInfo user={user} />
                            <ChevronsUpDown className="ml-auto size-3.5 opacity-50 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-2xl p-2 mb-2" align="end" side="top">
                        <div className="px-2 py-2">
                            <UserInfo user={user} showEmail />
                        </div>
                        <DropdownMenuSeparator />
                        <Link to="/settings/profile">
                            <DropdownMenuItem className="gap-2 py-2.5 rounded-xl cursor-pointer">
                                <Settings className="size-4 opacity-60" /> Account Settings
                            </DropdownMenuItem>
                        </Link>
                        <Link to="/settings/connections">
                            <DropdownMenuItem className="gap-2 py-2.5 rounded-xl cursor-pointer">
                                <Share2 className="size-4 opacity-60" /> Social Connections
                            </DropdownMenuItem>
                        </Link>
                        <Link to="/settings/billing">
                            <DropdownMenuItem className="gap-2 py-2.5 rounded-xl cursor-pointer">
                                <CreditCard className="size-4 opacity-60" /> Billing & Plan
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="gap-2 py-2.5 rounded-xl cursor-pointer">
                            <Bell className="size-4 opacity-60" /> Notifications
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link to="/login">
                            <DropdownMenuItem className="gap-2 py-2.5 rounded-xl cursor-pointer text-rose-500 hover:text-rose-500">
                                <LogOut className="size-4" /> Log out
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};
