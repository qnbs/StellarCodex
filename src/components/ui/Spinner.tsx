import React from 'react';
import { Icon } from './Icon';

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <Icon name="LoaderCircle" className={`w-8 h-8 animate-spin ${className}`} />
);
