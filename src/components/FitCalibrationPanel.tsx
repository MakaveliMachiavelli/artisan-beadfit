import React from 'react';
import { Ruler } from 'lucide-react';
import { Panel, SectionHeading, OptionCard, Segmented } from './ui';
import { WRIST_MIN_MM, WRIST_MAX_MM, clampWristMm } from '../braceletFit';

interface FitCalibrationPanelProps {
  unit: 'cm' | 'mm' | 'in';
  setUnit: (u: 'cm' | 'mm' | 'in') => void;
  wristMm: number;
  setWristMm: (val: number) => void;
  ease: number;
  setEase: (val: number) => void;
  showToast: (msg: string) => void;
}

const EASE_OPTIONS = [
  { label: 'Snug', val: 3, desc: '+3mm · skin-close' },
  { label: 'Standard', val: 6, desc: '+6mm · drapes' },
  { label: 'Relaxed', val: 12, desc: '+12mm · loose' },
] as const;

export const FitCalibrationPanel: React.FC<FitCalibrationPanelProps> = ({
  unit,
  setUnit,
  wristMm,
  setWristMm,
  ease,
  setEase,
  showToast,
}) => {
  const formattedWristVal = () => {
    if (unit === 'cm') return (wristMm / 10).toFixed(1);
    if (unit === 'in') return (wristMm / 25.4).toFixed(2);
    return String(wristMm);
  };

  const handleWristInputChange = (val: string) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return;
    let targetMm = parsed;
    if (unit === 'cm') targetMm = parsed * 10;
    else if (unit === 'in') targetMm = parsed * 25.4;
    setWristMm(clampWristMm(targetMm));
  };

  const pct = ((wristMm - WRIST_MIN_MM) / (WRIST_MAX_MM - WRIST_MIN_MM)) * 100;

  return (
    <Panel>
      <div className="space-y-5">
        <SectionHeading
          step={2}
          icon={<Ruler className="h-4 w-4" />}
          title="Fit calibration"
          hint="Measure snugly around the wrist bone, then choose how the strand should sit."
          trailing={
            <Segmented
              label="Measurement unit"
              value={unit}
              onChange={(u) => {
                setUnit(u);
                showToast(`Unit: ${u.toUpperCase()}`);
              }}
              options={[
                { value: 'cm', label: 'cm' },
                { value: 'mm', label: 'mm' },
                { value: 'in', label: 'in' },
              ]}
            />
          }
        />

        {/* Measurement */}
        <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white/60 p-4">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <label htmlFor="wrist-value" className="label-micro block">
                Wrist circumference
              </label>
              <div className="mt-1 flex items-baseline gap-1.5">
                <input
                  id="wrist-value"
                  type="number"
                  step={unit === 'in' ? 0.25 : 0.1}
                  value={formattedWristVal()}
                  onChange={(e) => handleWristInputChange(e.target.value)}
                  className="numeral w-[4.5ch] bg-transparent text-[34px] font-semibold leading-none tracking-tight text-[var(--theme-primary)] focus:outline-none"
                />
                <span className="label-micro-accent label-micro">{unit}</span>
              </div>
            </div>
            <span className="numeral shrink-0 text-[12px] text-[var(--color-text-muted)]">
              {WRIST_MIN_MM / 10}–{WRIST_MAX_MM / 10} cm
            </span>
          </div>

          <div className="mt-4">
            <input
              type="range"
              aria-label="Wrist circumference"
              min={WRIST_MIN_MM}
              max={WRIST_MAX_MM}
              step={1}
              value={wristMm}
              onChange={(e) => setWristMm(parseInt(e.target.value, 10))}
              className="machined-slider"
            />
            {/* Ticks carry meaning, so they are positioned to the real scale
                rather than spaced evenly with justify-between. */}
            <div className="relative mt-2 h-4">
              {[
                { at: 130, label: 'Petite' },
                { at: 165, label: 'Standard' },
                { at: 220, label: 'Generous' },
              ].map((t) => {
                const left = ((t.at - WRIST_MIN_MM) / (WRIST_MAX_MM - WRIST_MIN_MM)) * 100;
                const near = Math.abs(pct - left) < 9;
                return (
                  <span
                    key={t.label}
                    className={`label-micro absolute top-0 -translate-x-1/2 whitespace-nowrap ${
                      near ? 'text-[var(--color-text-accent)]' : ''
                    }`}
                    style={{ left: `${left}%` }}
                  >
                    {t.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ease */}
        <fieldset>
          <legend className="label-micro mb-2">Comfort allowance</legend>
          <div className="grid grid-cols-3 gap-1.5">
            {EASE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.val}
                name="ease"
                selected={ease === opt.val}
                onSelect={() => setEase(opt.val)}
                title={opt.label}
                subtitle={opt.desc}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </Panel>
  );
};
