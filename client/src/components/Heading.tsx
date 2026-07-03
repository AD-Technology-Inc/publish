import React from 'react';

interface Props {
    title: string;
    description?: string;
}

export const Heading: React.FC<Props> = ({ title, description }) => {
    return (
        <div className="mb-8 space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            {description && (
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
};
