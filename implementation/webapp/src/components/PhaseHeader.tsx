import type { ReactNode } from 'react';

interface PhaseHeaderProps {
    title: string;
    subtitle?: string;
    badge?: string;
    children?: ReactNode;
}

export function PhaseHeader({ title, subtitle, badge, children }: PhaseHeaderProps) {
    return (
        <header className="text-center space-y-3 pb-2">
            {badge && (
                <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-violet-400 bg-violet-900/30 border border-violet-700/40 rounded-full">
                    {badge}
                </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{title}</h1>
            {subtitle && (
                <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                    {subtitle}
                </p>
            )}
            {children}
        </header>
    );
}
