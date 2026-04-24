import { useTranslation } from '../i18n';
import { Button } from '../components/Button';

interface IntroPhaseProps {
    onStart: () => void;
    onOpenResearch?: () => void;
}

export function IntroPhase({ onStart, onOpenResearch }: IntroPhaseProps) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 animate-fade-in">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-md w-full space-y-10 text-center">
                {/* Title */}
                <div className="space-y-3">
                    <h1 className="text-4xl sm:text-5xl font-extrabold gradient-text tracking-tight">
                        {t('app.title')}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">
                        {t('app.tagline')}
                    </p>
                </div>

                {/* Divider */}
                <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-violet-600 mx-auto rounded-full" />

                {/* Copy */}
                <div className="glass-card p-8 space-y-5 text-left">
                    <p className="text-xl font-semibold text-slate-100 leading-snug">
                        {t('phases.intro.headline')}
                    </p>
                    <div className="space-y-3 text-slate-400 text-sm leading-relaxed">
                        <p className="flex gap-3">
                            <span className="text-violet-400 font-bold mt-0.5">→</span>
                            {t('phases.intro.body1')}
                        </p>
                        <p className="flex gap-3">
                            <span className="text-violet-400 font-bold mt-0.5">→</span>
                            {t('phases.intro.body2')}
                        </p>
                        <p className="flex gap-3">
                            <span className="text-violet-400 font-bold mt-0.5">→</span>
                            {t('phases.intro.body3')}
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="space-y-3">
                    <Button size="lg" fullWidth onClick={onStart}>
                        {t('phases.intro.cta')}
                    </Button>
                    <p className="text-xs text-slate-600">{t('phases.intro.note')}</p>
                    {onOpenResearch && (
                        <button
                            onClick={onOpenResearch}
                            className="text-xs text-slate-500 hover:text-blue-400 transition-colors w-full text-center pt-1"
                        >
                            {t('research.linkLabel')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
