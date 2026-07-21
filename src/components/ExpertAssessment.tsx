import React from 'react';
import { Info } from 'lucide-react';
import { Panel, Badge, Meter } from './ui';

interface ExpertAssessmentProps {
  expertAnalysis: {
    colorHarmony: string;
    expertVerdict: string;
    hardnessWarning?: string | null;
    energies: {
      protection: number;
      abundance: number;
      calm: number;
      love: number;
      clarity: number;
      vitality: number;
    };
  };
}

/**
 * Explicit hex per meter.
 *
 * The previous implementation passed Tailwind class names as the bar colour,
 * and one of them was `glass-panel` — a translucent near-white fill sitting on
 * a near-white track, so "Abundance" was invisible at every value, not just
 * zero. Values are literal hex so a bar can never disappear into its track,
 * and each is dark enough to hold contrast against the sunken surface.
 */
const ENERGY_COLORS = {
  protection: '#3d3a31',
  abundance: '#1f5f43',
  calm: '#2f6f9e',
  love: '#b06079',
  clarity: '#4c3b6f',
  vitality: '#a8571c',
} as const;

export const ExpertAssessment: React.FC<ExpertAssessmentProps> = ({ expertAnalysis }) => {
  const { energies } = expertAnalysis;

  const meters = [
    { key: 'protection', name: 'Protection', score: energies.protection },
    { key: 'abundance', name: 'Abundance', score: energies.abundance },
    { key: 'calm', name: 'Inner calm', score: energies.calm },
    { key: 'love', name: 'Heart healing', score: energies.love },
    { key: 'clarity', name: 'Clarity', score: energies.clarity },
    { key: 'vitality', name: 'Vitality', score: energies.vitality },
  ] as const;

  return (
    <Panel className="h-full">
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-heading font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">
              Expert assessment
            </h3>
            <p className="label-micro mt-1">Live design critique</p>
          </div>
          <Badge tone="accent">{expertAnalysis.colorHarmony}</Badge>
        </div>

        <blockquote className="border-l-2 border-[var(--color-gold-300)] pl-3.5 font-serif text-subheading italic leading-relaxed text-[var(--color-text-secondary)]">
          {expertAnalysis.expertVerdict}
        </blockquote>

        <div className="space-y-3">
          <span className="label-micro block">Metaphysical synergy</span>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {meters.map((m) => (
              <Meter key={m.key} label={m.name} value={m.score} color={ENERGY_COLORS[m.key]} />
            ))}
          </div>
        </div>

        {expertAnalysis.hardnessWarning && (
          <div
            role="status"
            className="mt-auto flex items-start gap-2.5 rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-warning-fg)_22%,transparent)] bg-[var(--color-warning-bg)] p-3 text-small leading-relaxed text-[var(--color-warning-fg)]"
          >
            <Info className="mt-px h-4 w-4 shrink-0" />
            <span>{expertAnalysis.hardnessWarning}</span>
          </div>
        )}
      </div>
    </Panel>
  );
};
