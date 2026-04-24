import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useTranslation } from '../i18n';
import type { ArchetypeScores } from '../types';
import { ARCHETYPES } from '../data/archetypes';
import { ARCHETYPE_IDS } from '../engine/scoring';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
    pulseScores: ArchetypeScores;
    idealScores: ArchetypeScores;
}

export function RadarChart({ pulseScores, idealScores }: RadarChartProps) {
    const { t } = useTranslation();

    const labels = ARCHETYPE_IDS.map((id) => {
        const archetype = ARCHETYPES.find((a) => a.id === id);
        return archetype ? t(archetype.nameKey) : id;
    });

    const pulseData = ARCHETYPE_IDS.map((id) => pulseScores[id]);
    const idealData = ARCHETYPE_IDS.map((id) => idealScores[id]);

    const data = {
        labels,
        datasets: [
            {
                label: t('phases.diagnosticMirror.pulseLabel'),
                data: pulseData,
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderColor: 'rgba(59, 130, 246, 0.9)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 1.5,
                pointRadius: 4,
                borderDash: [] as number[],
            },
            {
                label: t('phases.diagnosticMirror.idealLabel'),
                data: idealData,
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                borderColor: 'rgba(139, 92, 246, 0.9)',
                borderWidth: 2,
                borderDash: [6, 3],
                pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 1.5,
                pointRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#94a3b8',
                    font: { size: 12, family: 'Inter' },
                    padding: 20,
                    usePointStyle: true,
                    pointStyleWidth: 12,
                },
            },
            tooltip: {
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                borderWidth: 1,
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
                callbacks: {
                    label: (ctx: { dataset: { label?: string }; raw: unknown }) =>
                        ` ${ctx.dataset.label ?? ''}: ${ctx.raw}`,
                },
            },
        },
        scales: {
            r: {
                min: 0,
                ticks: {
                    display: false,
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                },
                angleLines: {
                    color: 'rgba(148, 163, 184, 0.1)',
                },
                pointLabels: {
                    color: '#94a3b8',
                    font: { size: 10, family: 'Inter' },
                },
            },
        },
    };

    return (
        <div className="relative w-full" style={{ height: '360px' }}>
            <Radar data={data} options={options} />
        </div>
    );
}
