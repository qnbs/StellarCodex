import React from 'react';
import * as lucide from 'lucide-react';

export const Icon: React.FC<{ name: keyof typeof lucide; className?: string }> = ({ name, className }) => {
    const LucideIcon = lucide[name];
    return LucideIcon ? <LucideIcon className={className} aria-hidden="true" /> : null;
};
