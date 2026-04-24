import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { ReactNode } from 'react';
import { useTranslation } from './i18n';
import { ARCHETYPES } from './data/archetypes';
// The ?raw suffix (provided by Vite) imports the file as a plain string at build time.
// The path goes 3 levels up from src/ to the repo root, then into research/docs/.
import researchContent from '../../../research/docs/research.md?raw';

type ResearchTab = 'overview' | 'article';

export interface ResearchPageProps {
    onClose: () => void;
}

// ─── Static display data ──────────────────────────────────────────────────────

type AttractionLevel = 'very_high' | 'high' | 'medium' | 'low';
type StabilityLevel = 'high' | 'medium' | 'low';

const ARCHETYPE_RATINGS: Record<string, { attraction: AttractionLevel; stability: StabilityLevel }> = {
    narcissistic_charming: { attraction: 'very_high', stability: 'low' },
    social_dominant: { attraction: 'very_high', stability: 'medium' },
    adventurous_charismatic: { attraction: 'high', stability: 'medium' },
    avoidant_independent: { attraction: 'high', stability: 'medium' },
    anxious_intense: { attraction: 'medium', stability: 'low' },
    impulsive_disorganized: { attraction: 'medium', stability: 'low' },
    secure_balanced: { attraction: 'medium', stability: 'high' },
    consistent_reliable: { attraction: 'low', stability: 'high' },
};

// Display order: high attraction → high stability (reveals the paradox visually)
const ARCHETYPE_DISPLAY_ORDER = [
    'narcissistic_charming',
    'social_dominant',
    'adventurous_charismatic',
    'avoidant_independent',
    'anxious_intense',
    'impulsive_disorganized',
    'secure_balanced',
    'consistent_reliable',
] as const;

const ATTRACTION_STARS: Record<AttractionLevel, string> = {
    very_high: '★★★★★',
    high: '★★★★☆',
    medium: '★★★☆☆',
    low: '★★☆☆☆',
};

const STABILITY_COLORS: Record<StabilityLevel, string> = {
    high: 'text-emerald-400',
    medium: 'text-amber-400',
    low: 'text-red-400',
};

// ─── Markdown component map ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const md: Record<string, React.ComponentType<any>> = {
    h1: ({ children }: { children?: ReactNode }) => (
        <h1 className="text-3xl font-bold gradient-text mb-6 mt-10 leading-tight">{children}</h1>
    ),
    h2: ({ children }: { children?: ReactNode }) => (
        <h2 className="text-2xl font-bold text-slate-100 mb-4 mt-10 pb-2 border-b border-slate-800 leading-snug">
            {children}
        </h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
        <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-7">{children}</h3>
    ),
    h4: ({ children }: { children?: ReactNode }) => (
        <h4 className="text-base font-semibold text-slate-300 mb-2 mt-5">{children}</h4>
    ),
    p: ({ children }: { children?: ReactNode }) => (
        <p className="text-slate-400 leading-relaxed mb-4 text-[15px]">{children}</p>
    ),
    strong: ({ children }: { children?: ReactNode }) => (
        <strong className="text-slate-200 font-semibold">{children}</strong>
    ),
    em: ({ children }: { children?: ReactNode }) => (
        <em className="text-slate-300 italic">{children}</em>
    ),
    a: ({ href, children }: { href?: string; children?: ReactNode }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
        >
            {children}
        </a>
    ),
    table: ({ children }: { children?: ReactNode }) => (
        <div className="overflow-x-auto mb-6 rounded-xl border border-slate-700/50">
            <table className="w-full text-sm">{children}</table>
        </div>
    ),
    thead: ({ children }: { children?: ReactNode }) => (
        <thead className="bg-slate-800">{children}</thead>
    ),
    tbody: ({ children }: { children?: ReactNode }) => (
        <tbody className="divide-y divide-slate-800">{children}</tbody>
    ),
    th: ({ children }: { children?: ReactNode }) => (
        <th className="p-3 text-left font-semibold text-slate-300 whitespace-nowrap">{children}</th>
    ),
    td: ({ children }: { children?: ReactNode }) => (
        <td className="p-3 text-slate-400 align-top">{children}</td>
    ),
    tr: ({ children }: { children?: ReactNode }) => (
        <tr className="hover:bg-slate-800/40 transition-colors">{children}</tr>
    ),
    ul: ({ children }: { children?: ReactNode }) => (
        <ul className="list-disc list-inside space-y-1.5 mb-4 text-slate-400 pl-2">{children}</ul>
    ),
    ol: ({ children }: { children?: ReactNode }) => (
        <ol className="list-decimal list-inside space-y-1.5 mb-4 text-slate-400 pl-2">{children}</ol>
    ),
    li: ({ children }: { children?: ReactNode }) => (
        <li className="leading-relaxed">{children}</li>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
        <blockquote className="border-l-4 border-blue-600 pl-4 italic text-slate-500 my-6">
            {children}
        </blockquote>
    ),
    hr: () => <hr className="border-slate-800 my-8" />,
    sup: ({ children }: { children?: ReactNode }) => {
        const num = String(children).trim();
        if (!/^\d+$/.test(num)) {
            return <sup className="text-blue-400 text-xs align-super ml-0.5 leading-none">{children}</sup>;
        }
        return (
            <sup className="text-xs align-super ml-0.5 leading-none">
                <a
                    href={`#fn-${num}`}
                    onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        document.getElementById(`fn-${num}`)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                    {num}
                </a>
            </sup>
        );
    },
    // Replace unresolvable Google Docs image references gracefully
    img: () => <span className="text-slate-600 italic text-xs">[fórmula]</span>,
    code: ({ children }: { children?: ReactNode }) => (
        <code className="bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono">
            {children}
        </code>
    ),
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
    const { t } = useTranslation();

    const findings = [
        {
            icon: '⚠️',
            borderColor: 'border-red-700/40 bg-red-900/10',
            title: t('research.overview.findings.neuroticism.title'),
            body: t('research.overview.findings.neuroticism.body'),
        },
        {
            icon: '📈',
            borderColor: 'border-emerald-700/40 bg-emerald-900/10',
            title: t('research.overview.findings.conscientiousness.title'),
            body: t('research.overview.findings.conscientiousness.body'),
        },
        {
            icon: '🪞',
            borderColor: 'border-amber-700/40 bg-amber-900/10',
            title: t('research.overview.findings.darkTriad.title'),
            body: t('research.overview.findings.darkTriad.body'),
        },
        {
            icon: '🔗',
            borderColor: 'border-blue-700/40 bg-blue-900/10',
            title: t('research.overview.findings.attachment.title'),
            body: t('research.overview.findings.attachment.body'),
        },
    ];

    const sources = [
        {
            author: 'Buss, 1989',
            accentColor: 'hover:border-violet-500 group-hover:text-violet-400',
            labelColor: 'text-violet-400',
            title: 'Preferências Sexuais em 37 Culturas',
            body: 'Documentou a universalidade da hipergamia e a preferência feminina por recursos e status social em parceiros de longo prazo.',
        },
        {
            author: 'Zuckerman, 2007',
            accentColor: 'hover:border-amber-500',
            labelColor: 'text-amber-400',
            title: 'Busca por Sensações',
            body: '"Sensation seeking" está intimamente associado a comportamento sexual exploratório, dificultando a exclusividade a longo prazo.',
        },
        {
            author: 'Roberts et al., 2007',
            accentColor: 'hover:border-emerald-500',
            labelColor: 'text-emerald-400',
            title: 'Conscienciosidade e Saúde',
            body: 'Cônjuge consciencioso prediz melhor saúde e maior capacidade física, além de satisfação conjugal persistente ao longo de décadas.',
        },
        {
            author: 'Hazan & Shaver, 1987',
            accentColor: 'hover:border-blue-500',
            labelColor: 'text-blue-400',
            title: 'Teoria do Apego Adulto',
            body: 'Apenas o apego seguro fornece a base para regulação emocional mútua e intimidade sustentável a longo prazo.',
        },
        {
            author: 'Paulhus & Williams, 2002',
            accentColor: 'hover:border-red-500',
            labelColor: 'text-red-400',
            title: 'O Paradoxo da Tríade Sombria',
            body: 'Traços narcisistas geram alta atração inicial mas resultam em declínio acentuado de satisfação em relações contínuas.',
        },
        {
            author: 'Karney & Bradbury, 1995',
            accentColor: 'hover:border-slate-500',
            labelColor: 'text-slate-400',
            title: 'Modelo Vulnerabilidade-Estresse-Adaptação',
            body: 'O comportamento relacional é moderado pelo contexto; traços de personalidade interagem com as circunstâncias da vida.',
        },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
            {/* Hero */}
            <div className="text-center space-y-5">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold tracking-widest border border-blue-500/30 uppercase">
                    {t('research.overview.badge')}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold gradient-text leading-tight">
                    {t('research.overview.heroTitle')}
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed text-base">
                    {t('research.overview.heroSubtitle')}
                </p>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { value: '37', label: 'culturas estudadas por Buss' },
                    { value: '45', label: 'anos de estudos longitudinais' },
                    { value: '8', label: 'arquétipos comportamentais' },
                    { value: '50+', label: 'nações com dados Big Five' },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card p-4 text-center space-y-1">
                        <div className="text-3xl font-extrabold gradient-text">{stat.value}</div>
                        <div className="text-xs text-slate-500 leading-tight">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Key Findings */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-100">
                    {t('research.overview.findingsTitle')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {findings.map((f) => (
                        <div
                            key={f.title}
                            className={`rounded-xl border p-5 space-y-2 ${f.borderColor}`}
                        >
                            <div className="flex items-start gap-2.5">
                                <span className="text-xl flex-shrink-0">{f.icon}</span>
                                <h3 className="font-semibold text-slate-200 text-sm leading-snug">{f.title}</h3>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed pl-8">{f.body}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Archetype table — ordered from high attraction → high stability to reveal the paradox */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-100">
                        {t('research.overview.archetypesTitle')}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {t('research.overview.archetypesSubtitle')}
                    </p>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-800/80">
                            <tr>
                                <th className="p-4 text-left font-semibold text-slate-300">
                                    {t('research.overview.tableHeaders.archetype')}
                                </th>
                                <th className="p-4 text-center font-semibold text-slate-300 whitespace-nowrap">
                                    {t('research.overview.tableHeaders.initialAttraction')}
                                </th>
                                <th className="p-4 text-left font-semibold text-slate-300 whitespace-nowrap">
                                    {t('research.overview.tableHeaders.longTermOutcome')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {ARCHETYPE_DISPLAY_ORDER.map((id) => {
                                const archetype = ARCHETYPES.find((a) => a.id === id)!;
                                const rating = ARCHETYPE_RATINGS[id];
                                return (
                                    <tr key={id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-1.5 h-8 rounded-full bg-gradient-to-b flex-shrink-0 ${archetype.gradientClass}`}
                                                />
                                                <span className="font-medium text-slate-200">
                                                    {t(archetype.nameKey)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-amber-400 tracking-tight text-xs font-mono">
                                            {ATTRACTION_STARS[rating.attraction]}
                                        </td>
                                        <td className={`p-4 text-sm ${STABILITY_COLORS[rating.stability]}`}>
                                            {t(archetype.shortOutcomeKey)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sources */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-100">
                        {t('research.overview.sourcesTitle')}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {t('research.overview.sourcesSubtitle')}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sources.map((source) => (
                        <div
                            key={source.author}
                            className={`bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 transition-colors ${source.accentColor} space-y-2`}
                        >
                            <div className={`font-mono text-xs ${source.labelColor}`}>{source.author}</div>
                            <h4 className="font-semibold text-slate-200 text-sm leading-snug">{source.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{source.body}</p>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-600 text-center pt-2">
                    {t('research.overview.fullArticleNote')}
                </p>
            </div>
        </div>
    );
}

// ─── Article Tab ──────────────────────────────────────────────────────────────

function ArticleTab({ content }: { content: string }) {
    const { t } = useTranslation();

    // Clean up inline image references and inject anchor IDs into the references section
    const processedContent = (() => {
        let c = content.replace(/!\[\]\[image\d+\]/g, '_[fórmula]_');
        const refMarker = '#### **Referências citadas**';
        const refIdx = c.indexOf(refMarker);
        if (refIdx !== -1) {
            const before = c.slice(0, refIdx + refMarker.length);
            const after = c.slice(refIdx + refMarker.length);
            const withAnchors = after.replace(
                /^(\d+)\. /gm,
                (_, n) => `${n}. <span id="fn-${n}"></span>`
            );
            c = before + withAnchors;
        }
        return c;
    })();

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
            {/* Info banner */}
            <div className="mb-8 rounded-xl border border-blue-700/40 bg-blue-900/10 p-4 flex gap-3">
                <span className="text-blue-400 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
                <div className="space-y-0.5">
                    <p className="text-sm font-medium text-blue-300">{t('research.article.intro')}</p>
                    <p className="text-xs text-blue-400/70">{t('research.article.warning')}</p>
                </div>
            </div>

            {/* Rendered markdown */}
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                components={md as any}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ResearchPage({ onClose }: ResearchPageProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<ResearchTab>('overview');

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-slide-up overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/60 flex-shrink-0">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
                    {/* Back button */}
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm whitespace-nowrap"
                        aria-label={t('research.close')}
                    >
                        ← {t('research.close')}
                    </button>

                    {/* Tabs */}
                    <div className="flex-1 flex justify-center">
                        <div className="flex bg-slate-900 rounded-lg p-1 gap-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'overview'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {t('research.tabs.overview')}
                            </button>
                            <button
                                onClick={() => setActiveTab('article')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'article'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {t('research.tabs.article')}
                            </button>
                        </div>
                    </div>

                    {/* Spacer to optically centre the tabs */}
                    <div className="w-16 flex-shrink-0" />
                </div>
            </header>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'overview' ? (
                    <OverviewTab />
                ) : (
                    <ArticleTab content={researchContent} />
                )}
            </div>
        </div>
    );
}
