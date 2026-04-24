interface ProgressBarProps {
    current: number;
    total: number;
    label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">{label}</p>
            )}
            <div className="relative h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={current}
                    aria-valuemin={0}
                    aria-valuemax={total}
                />
            </div>
        </div>
    );
}
