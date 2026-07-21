import React from 'react';
import { Info } from 'lucide-react';

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

export const ExpertAssessment: React.FC<ExpertAssessmentProps> = ({
  expertAnalysis,
}) => {
  return (
    <div className="glass-panel border hairline border-obsidian-200/50 p-6 rounded-sm shadow-sm space-y-6">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 glass-panel rounded-full animate-ping" />
        <h3 className="font-serif text-xl font-bold text-obsidian-950">Bead Expert Assessment</h3>
        <span className="ml-auto font-mono text-[10px] text-gold-600 glass-panel px-2.5 py-1 rounded-full uppercase tracking-[0.18em]">
          Harmony: {expertAnalysis.colorHarmony}
        </span>
      </div>

      {/* Verdict text */}
      <p className="font-sans text-sm text-obsidian-600 leading-relaxed italic">
        &ldquo;{expertAnalysis.expertVerdict}&rdquo;
      </p>

      {/* Metaphysical loading metrics */}
      <div className="space-y-3 pt-2">
        <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400 tracking-[0.18em]">Metaphysical Synergy Profile</span>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
          {[
            { name: 'Protection', score: expertAnalysis.energies.protection, color: 'bg-[var(--theme-primary)]' },
            { name: 'Abundance', score: expertAnalysis.energies.abundance, color: 'glass-panel' },
            { name: 'Inner Calm', score: expertAnalysis.energies.calm, color: 'bg-blue-400' },
            { name: 'Heart Healing', score: expertAnalysis.energies.love, color: 'bg-rose-300' },
            { name: 'Intellect & Clarity', score: expertAnalysis.energies.clarity, color: 'bg-indigo-900' },
            { name: 'Vitality & Core', score: expertAnalysis.energies.vitality, color: 'bg-amber-600' }
          ].map((stat) => (
            <div key={stat.name} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-obsidian-800">
                <span>{stat.name}</span>
                <span className="font-mono">{stat.score}%</span>
              </div>
              <div className="h-1.5 w-full glass-panel rounded-full overflow-hidden border hairline border-obsidian-200/50">
                <div 
                  className={`h-full ${stat.color} transition-all duration-500`}
                  style={{ width: `${stat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mohs Hardness advisory warnings */}
      {expertAnalysis.hardnessWarning && (
        <div className="text-xs bg-amber-50/50 text-amber-800 border border-amber-200/50 p-3 rounded-sm flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{expertAnalysis.hardnessWarning}</span>
        </div>
      )}
    </div>
  );
};
