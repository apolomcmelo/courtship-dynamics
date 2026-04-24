import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '../i18n';
import { IntroPhase } from '../phases/IntroPhase';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import App from '../App';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderWithI18n(ui: React.ReactElement) {
    return render(<I18nProvider defaultLocale="pt-BR">{ui}</I18nProvider>);
}

// ─── Button component ─────────────────────────────────────────────────────────

describe('Button', () => {
    it('renders children', () => {
        render(<Button>Clique aqui</Button>);
        expect(screen.getByText('Clique aqui')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        let clicked = false;
        render(<Button onClick={() => { clicked = true; }}>Clique</Button>);
        fireEvent.click(screen.getByText('Clique'));
        expect(clicked).toBe(true);
    });

    it('does not call onClick when disabled', () => {
        let clicked = false;
        render(<Button disabled onClick={() => { clicked = true; }}>Clique</Button>);
        fireEvent.click(screen.getByText('Clique'));
        expect(clicked).toBe(false);
    });

    it('renders with fullWidth class', () => {
        render(<Button fullWidth>Botão</Button>);
        const btn = screen.getByText('Botão').closest('button');
        expect(btn?.className).toContain('w-full');
    });
});

// ─── ProgressBar component ────────────────────────────────────────────────────

describe('ProgressBar', () => {
    it('renders with correct aria attributes', () => {
        render(<ProgressBar current={2} total={6} />);
        const bar = screen.getByRole('progressbar');
        expect(bar).toHaveAttribute('aria-valuenow', '2');
        expect(bar).toHaveAttribute('aria-valuemax', '6');
    });

    it('renders label when provided', () => {
        render(<ProgressBar current={1} total={3} label="Progresso" />);
        expect(screen.getByText('Progresso')).toBeInTheDocument();
    });

    it('sets width style based on percentage', () => {
        render(<ProgressBar current={3} total={6} />);
        const bar = screen.getByRole('progressbar');
        expect(bar).toHaveStyle({ width: '50%' });
    });
});

// ─── IntroPhase component ─────────────────────────────────────────────────────

describe('IntroPhase', () => {
    it('renders the app title', () => {
        renderWithI18n(<IntroPhase onStart={() => { }} />);
        expect(screen.getByText('Dinâmica de Atração')).toBeInTheDocument();
    });

    it('renders the CTA button in pt-BR', () => {
        renderWithI18n(<IntroPhase onStart={() => { }} />);
        expect(screen.getByText('Estou pronta')).toBeInTheDocument();
    });

    it('calls onStart when CTA is clicked', () => {
        let started = false;
        renderWithI18n(<IntroPhase onStart={() => { started = true; }} />);
        fireEvent.click(screen.getByText('Estou pronta'));
        expect(started).toBe(true);
    });
});

// ─── App integration ──────────────────────────────────────────────────────────

describe('App', () => {
    it('renders the intro phase by default', () => {
        render(<App />);
        expect(screen.getByText('Dinâmica de Atração')).toBeInTheDocument();
        expect(screen.getByText('Estou pronta')).toBeInTheDocument();
    });

    it('transitions to the reactive game phase when start is clicked', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Estou pronta'));
        // After clicking, we should see the reactive game phase content
        expect(screen.getByText('Situações do Dia a Dia')).toBeInTheDocument();
    });

    it('shows the first scenario title after starting', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Estou pronta'));
        // The first scenario is the bar scenario
        expect(screen.getByText('Bar com Música ao Vivo')).toBeInTheDocument();
    });

    it('shows progress text for the first scenario', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Estou pronta'));
        expect(screen.getByText('Cenário 1 de 6')).toBeInTheDocument();
    });
});
