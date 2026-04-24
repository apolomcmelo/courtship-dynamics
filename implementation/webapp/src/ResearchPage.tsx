import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { ReactNode } from 'react';
import {
    Chart,
    ScatterController,
    LinearScale,
    PointElement,
    BarController,
    BarElement,
    CategoryScale,
    Legend,
    Tooltip,
} from 'chart.js';
import { useTranslation } from './i18n';
// The ?raw suffix (provided by Vite) imports the file as a plain string at build time.
// The path goes 3 levels up from src/ to the repo root, then into research/docs/.
import researchContent from '../../../research/docs/research.md?raw';

Chart.register(ScatterController, LinearScale, PointElement, BarController, BarElement, CategoryScale, Legend, Tooltip);

type ResearchTab = 'overview' | 'article';

export interface ResearchPageProps {
    onClose: () => void;
}

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

const GRID_COLOR = 'rgba(100, 116, 139, 0.2)';
const TICK_COLOR = '#94a3b8';
const LEGEND_COLOR = '#cbd5e1';

function ScatterChart() {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        if (chartRef.current) chartRef.current.destroy();
        chartRef.current = new Chart(canvasRef.current, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: t('research.overview.spectrum.legend.instability'),
                        data: [
                            { x: 10, y: 95 },
                            { x: 15, y: 75 },
                            { x: 20, y: 80 },
                        ],
                        backgroundColor: '#EF4444',
                        pointRadius: 8,
                        pointHoverRadius: 12,
                    },
                    {
                        label: t('research.overview.spectrum.legend.moderate'),
                        data: [
                            { x: 30, y: 90 },
                            { x: 35, y: 70 },
                            { x: 50, y: 85 },
                        ],
                        backgroundColor: '#3B82F6',
                        pointRadius: 8,
                        pointHoverRadius: 12,
                    },
                    {
                        label: t('research.overview.spectrum.legend.stability'),
                        data: [
                            { x: 90, y: 50 },
                            { x: 95, y: 65 },
                        ],
                        backgroundColor: '#10B981',
                        pointRadius: 8,
                        pointHoverRadius: 12,
                    },
                ],
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(51, 65, 85, 0.8)',
                        borderWidth: 1,
                        titleColor: '#e2e8f0',
                        bodyColor: '#94a3b8',
                    },
                    legend: { position: 'bottom', labels: { color: LEGEND_COLOR } },
                },
                scales: {
                    x: {
                        title: { display: true, text: t('research.overview.spectrum.xAxis'), font: { weight: 'bold' }, color: TICK_COLOR },
                        min: 0, max: 100,
                        grid: { color: GRID_COLOR },
                        ticks: { color: TICK_COLOR },
                    },
                    y: {
                        title: { display: true, text: t('research.overview.spectrum.yAxis'), font: { weight: 'bold' }, color: TICK_COLOR },
                        min: 0, max: 100,
                        grid: { color: GRID_COLOR },
                        ticks: { color: TICK_COLOR },
                    },
                },
            },
        });
        return () => { chartRef.current?.destroy(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <canvas ref={canvasRef} />;
}

function BarChart() {
    const { t, tRaw } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        if (chartRef.current) chartRef.current.destroy();
        const labels = tRaw('research.overview.psychology.traitLabels') as string[];
        chartRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: t('research.overview.psychology.stableLabel'),
                        data: [85, 20, 45, 55],
                        backgroundColor: '#10B981',
                        borderRadius: 4,
                    },
                    {
                        label: t('research.overview.psychology.unstableLabel'),
                        data: [25, 85, 75, 80],
                        backgroundColor: '#EF4444',
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(51, 65, 85, 0.8)',
                        borderWidth: 1,
                        titleColor: '#e2e8f0',
                        bodyColor: '#94a3b8',
                    },
                    legend: { labels: { color: LEGEND_COLOR } },
                },
                scales: {
                    x: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR } },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: t('research.overview.psychology.yAxis'), color: TICK_COLOR },
                        grid: { color: GRID_COLOR },
                        ticks: { color: TICK_COLOR },
                    },
                },
            },
        });
        return () => { chartRef.current?.destroy(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <canvas ref={canvasRef} />;
}

type ArchetypeRow = {
    name: string;
    behaviors: string;
    perception: string;
    outcome: string;
    perceptionHighlight: boolean;
    outcomeColor: 'red' | 'emerald' | 'amber';
    highlight?: boolean;
};

type ReferenceItem = {
    author: string;
    color: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
    title: string;
    body: string;
};

const OUTCOME_COLORS: Record<string, string> = {
    red: 'text-red-400',
    emerald: 'text-emerald-400 font-bold',
    amber: 'text-amber-400',
};

const REF_BORDER_COLORS: Record<string, string> = {
    blue: 'hover:border-blue-500/50',
    emerald: 'hover:border-emerald-500/50',
    red: 'hover:border-red-500/50',
    amber: 'hover:border-amber-500/50',
    purple: 'hover:border-purple-500/50',
};

const REF_LABEL_COLORS: Record<string, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
};

function OverviewTab() {
    const { t, tRaw } = useTranslation();
    const archetypes = tRaw('research.overview.structure.archetypes') as ArchetypeRow[];
    const references = tRaw('research.overview.references.items') as ReferenceItem[];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">

            {/* Hero */}
            <div className="text-center relative overflow-hidden py-10">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
                </div>
                <div className="relative">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold tracking-wider mb-4 border border-blue-500/30">
                        {t('research.overview.badge')}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                        <span className="gradient-text">{t('research.overview.heroTitle').split('vs.')[0]}vs.</span>{' '}
                        <span className="text-amber-400">Estabilidade</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                        {t('research.overview.heroSubtitle')}
                    </p>
                </div>
            </div>

            {/* Section 1 — Scatter chart */}
            <section>
                <div className="mb-8 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-100 mb-4">{t('research.overview.spectrum.title')}</h2>
                    <p className="text-slate-400 text-lg">{t('research.overview.spectrum.description')}</p>
                </div>
                <div className="glass-card p-6">
                    <div className="relative w-full max-w-3xl mx-auto h-80 md:h-96">
                        <ScatterChart />
                    </div>
                    <div className="mt-4 flex justify-center flex-wrap gap-6 text-sm text-slate-400">
                        {(['instability', 'moderate', 'stability'] as const).map((key) => (
                            <div key={key} className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${key === 'instability' ? 'bg-red-500' : key === 'moderate' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                {t(`research.overview.spectrum.legend.${key}`)}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 2 — Archetype table */}
            <section>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-100 mb-4">{t('research.overview.structure.title')}</h2>
                    <p className="text-slate-400 text-lg">{t('research.overview.structure.description')}</p>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/80 border-b border-slate-700">
                                <th className="p-5 font-semibold text-slate-300">{t('research.overview.structure.headers.archetype')}</th>
                                <th className="p-5 font-semibold text-slate-300">{t('research.overview.structure.headers.behaviors')}</th>
                                <th className="p-5 font-semibold text-slate-300">{t('research.overview.structure.headers.perception')}</th>
                                <th className="p-5 font-semibold text-slate-300">{t('research.overview.structure.headers.outcome')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-400">
                            {archetypes.map((row) => (
                                <tr
                                    key={row.name}
                                    className={`hover:bg-slate-800/30 transition-colors${row.highlight ? ' bg-emerald-950/20' : ''}`}
                                >
                                    <td className="p-5 font-bold text-slate-200">{row.name}</td>
                                    <td className="p-5">{row.behaviors}</td>
                                    <td className="p-5">
                                        {row.perceptionHighlight
                                            ? <span className="text-emerald-400 font-medium">{row.perception}</span>
                                            : <span className={row.highlight ? 'text-slate-500' : ''}>{row.perception}</span>
                                        }
                                    </td>
                                    <td className={`p-5 ${OUTCOME_COLORS[row.outcomeColor] ?? 'text-slate-400'}`}>{row.outcome}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Section 3 — Psychology */}
            <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-100 mb-4">{t('research.overview.psychology.title')}</h2>
                        <p className="text-slate-400 text-lg mb-6">
                            {t('research.overview.psychology.description').split(/(Extroversão|Conscienciosidade \(Conscientiousness\)|Neuroticismo)/).map((part, i) =>
                                ['Extroversão', 'Conscienciosidade (Conscientiousness)', 'Neuroticismo'].includes(part)
                                    ? <strong key={i} className="text-slate-200">{part}</strong>
                                    : part
                            )}
                        </p>
                        <div className="space-y-4">
                            <div className="glass-card p-4 flex items-start gap-4">
                                <div className="text-2xl flex-shrink-0 select-none">📈</div>
                                <div>
                                    <h4 className="font-bold text-slate-200">{t('research.overview.psychology.cards.conscientiousness.title')}</h4>
                                    <p className="text-sm text-slate-400">{t('research.overview.psychology.cards.conscientiousness.body')}</p>
                                </div>
                            </div>
                            <div className="glass-card p-4 flex items-start gap-4">
                                <div className="text-2xl flex-shrink-0 select-none">⚠️</div>
                                <div>
                                    <h4 className="font-bold text-slate-200">{t('research.overview.psychology.cards.neuroticism.title')}</h4>
                                    <p className="text-sm text-slate-400">{t('research.overview.psychology.cards.neuroticism.body')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-6">
                        <h3 className="text-center font-bold text-slate-300 mb-4">{t('research.overview.psychology.chartTitle')}</h3>
                        <div className="relative h-72 md:h-80">
                            <BarChart />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4 — References */}
            <section className="pb-8">
                <h2 className="text-3xl font-bold text-slate-100 mb-10 text-center">{t('research.overview.references.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {references.map((ref) => (
                        <div
                            key={ref.author}
                            className={`glass-card p-6 transition-colors ${REF_BORDER_COLORS[ref.color] ?? ''}`}
                        >
                            <div className={`mb-2 font-mono text-sm ${REF_LABEL_COLORS[ref.color] ?? 'text-slate-400'}`}>{ref.author}</div>
                            <h4 className="font-bold text-slate-200 mb-2">{ref.title}</h4>
                            <p className="text-sm text-slate-400">{ref.body}</p>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-600 text-center mt-8">{t('research.overview.fullArticleNote')}</p>
            </section>
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
