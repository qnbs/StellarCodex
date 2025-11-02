import React from 'react';
import * as lucide from 'lucide-react';
import { Icon } from './Icon';
import { useAppSelector } from '../../store/hooks';
import { themes } from '../../lib/constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    children: React.ReactNode;
    leftIcon?: keyof typeof lucide;
    size?: 'normal' | 'small';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', size = 'normal', children, leftIcon, className = '', ...props }, ref) => {
    const themeName = useAppSelector(state => state.ui.themeName);
    const theme = themes[themeName];
    const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
    const sizeStyles = { normal: "px-4 py-2 text-sm rounded-md", small: "p-2 rounded" };
    const variantStyles = {
        primary: `${theme.accentBg} ${theme.accentHoverBg} text-white ${theme.accentGlow}`,
        secondary: `bg-gray-700 hover:bg-gray-600 text-gray-200 ${theme.accentGlow}`,
        danger: `bg-red-600 hover:bg-red-500 text-white focus-visible:ring-red-500`,
        ghost: `text-gray-400 hover:${theme.accentText} ${theme.accentGlow}`
    };

    return (
        <button ref={ref} className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
            {leftIcon && <Icon name={leftIcon} className="w-4 h-4" />}
            {children}
        </button>
    );
});
