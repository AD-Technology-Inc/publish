import * as React from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import { Heading } from '@/components/Heading';
import { Button, Input, Label } from '@/components/ui/core';
import { useTitle } from '@/hooks/use-title';

export const Password: React.FC = () => {
    useTitle('Security Settings');
    
    const breadcrumbs = [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Password', href: '/settings/password' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <div className="space-y-6 text-left max-w-xl">
                    <Heading 
                        title="Update Password" 
                        description="Ensure your account is using a long, random password to stay secure." 
                    />
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current_password">Current Password</Label>
                            <Input id="current_password" type="password" className="rounded-xl h-11" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="new_password">New Password</Label>
                            <Input id="new_password" type="password" className="rounded-xl h-11" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="confirm_password">Confirm Password</Label>
                            <Input id="confirm_password" type="password" className="rounded-xl h-11" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button className="rounded-xl px-8 h-11 font-bold">Save Changes</Button>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
};

export default Password;
