import React, { memo, useState, useEffect } from 'react';
import * as lucide from 'lucide-react';
import { FeedbackState } from '../../types';
import { Icon } from './Icon';

export const FeedbackToast: React.FC<FeedbackState> = memo(({ message, type }) => {
    const [isExiting, setIsExiting] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsExiting(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    const toastStyles = {
        success: 'bg-green-600/30 border-green-500 text-green-300',
        delete: 'bg-red-600/30 border-red-500 text-red-300',
        error: 'bg-orange-600/30 border-orange-500 text-orange-300',
    };
    const iconName = { success: 'CheckCircle2', delete: 'Trash2', error: 'AlertTriangle' };

    return (
        <div className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-2xl border backdrop-blur-sm ${toastStyles[type]} ${isExiting ? 'toast-exit' : 'toast-enter'}`} role="status" aria-live="polite">
            <Icon name={iconName[type] as keyof typeof lucide} className="w-5 h-5" />
            <span className="font-bold">{message}</span>
        </div>
    );
});
