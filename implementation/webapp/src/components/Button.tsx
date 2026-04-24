import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
    primary:
        'bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:from-blue-600 hover:to-violet-700 shadow-lg shadow-violet-900/30',
    secondary:
        'bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700 hover:border-slate-500',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
    danger: 'bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/50',
};

const SIZE_CLASSES: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3.5 text-base rounded-xl',
};

export function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={[
                'font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                VARIANT_CLASSES[variant],
                SIZE_CLASSES[size],
                fullWidth ? 'w-full' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
