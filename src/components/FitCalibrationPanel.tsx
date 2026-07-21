import React from 'react';
import { Sliders } from 'lucide-react';

interface FitCalibrationPanelProps {
  unit: 'cm' | 'mm' | 'in';
  setUnit: (u: 'cm' | 'mm' | 'in') => void;
  wristMm: number;
  setWristMm: (val: number) => void;
  ease: number;
  setEase: (val: number) => void;
  showToast: (msg: string) => void;
}

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
    return wristMm.toString();
  };

  const handleWristInputChange = (val: string) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return;

    let targetMm = parsed;
    if (unit === 'cm') targetMm = parsed * 10;
    else if (unit === 'in') targetMm = parsed * 25.4;

    // Bounds safety
    if (targetMm < 130) targetMm = 130;
    if (targetMm > 230) targetMm = 230;

    setWristMm(Math.round(targetMm));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-600 tracking-[0.18em] font-semibold flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5" /> 1. Sizing Calibration
        </h3>
        
        {/* Unit Toggles */}
        <div className="inline-flex glass-panel p-1 rounded-sm hairline border-obsidian-200/50">
          {(['cm', 'mm', 'in'] as const).map((u) => (
            <button
              key={u}
              onClick={() => {
                setUnit(u);
                showToast(`Switched unit to ${u.toUpperCase()}`);
              }}
              className={`px-3 py-1 text-xs font-mono rounded-sm transition-all ${
                unit === u ? 'glass-panel shadow-ambient text-[var(--theme-primary)] font-semibold scale-105' : 'text-obsidian-400 hover:text-obsidian-700 hover:glass-panel'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Numerical Wrist Value Input */}
        <div className="md:col-span-5 glass-panel border hairline border-obsidian-200/50 p-4 rounded-sm flex items-baseline justify-between">
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400 tracking-[0.18em]">Wrist Circumference</span>
            <input
              type="number"
              step="0.1"
              value={formattedWristVal()}
              onChange={(e) => handleWristInputChange(e.target.value)}
              className="bg-transparent text-3xl font-serif font-bold text-[var(--theme-primary)] w-28 focus:outline-none"
            />
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold-500 font-semibold">{unit}</span>
        </div>

        {/* Range Slider for Micro-calibrating */}
        <div className="md:col-span-7 space-y-2">
          <input
            type="range"
            min="130"
            max="220"
            step="1"
            value={wristMm}
            onChange={(e) => setWristMm(parseInt(e.target.value))}
            className="machined-slider"
          />
          <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-obsidian-400">
            <span>Petite (13.0cm)</span>
            <span className="text-gold-600 font-semibold">Standard (16.5cm)</span>
            <span>Generous (22.0cm)</span>
          </div>
        </div>
      </div>

      {/* Comfort Ease selection */}
      <div>
        <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400 tracking-[0.18em] mb-2.5">Comfort Allowance (Gap Ease)</span>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Snug Fit', val: 3, desc: '+3mm ease (skin tight)' },
            { label: 'Standard Fit', val: 6, desc: '+6mm ease (drapes nicely)' },
            { label: 'Relaxed Fit', val: 12, desc: '+12mm ease (loose slip)' }
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => setEase(opt.val)}
              className={`p-3 text-left border rounded-sm transition-all duration-300 ${
                ease === opt.val 
                  ? 'bg-[var(--theme-primary)] border-obsidian-900 text-gold-100 shadow-md' 
                  : 'hairline border-obsidian-200/50 glass-panel hover:border-gold-400 text-obsidian-800'
              }`}
            >
              <span className="block text-xs font-semibold">{opt.label}</span>
              <span className="block text-[10px] font-mono uppercase tracking-[0.15em] mt-0.5 opacity-60">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
