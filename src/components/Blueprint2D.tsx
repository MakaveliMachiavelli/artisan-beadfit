import React from 'react';
import { BeadInstance, CatalogItem } from '../types';
import { GEMSTONE_DB } from '../data';
import { Panel } from './ui';

interface Blueprint2DProps {
  beads: BeadInstance[];
  gemstoneNames: string[];
  xrayMode: boolean;
  designStats: {
    target: number;
    innerFit: number;
    discrepancy: number;
    status: 'perfect' | 'loose' | 'tight';
  };
  isSpinning: boolean;
  manualAngle: number;
  activeCharm: CatalogItem | null;
  selectedBeadIndex: number | null;
  setSelectedBeadIndex: (index: number | null) => void;
  wristMm: number;
  spinSpeed: 'slow' | 'medium' | 'fast';
  blueprintMetrics: {
    rWrist: number;
    rTarget: number;
    innerBound: number;
    rCenter: number;
  };
}

export const Blueprint2D: React.FC<Blueprint2DProps> = ({
  beads,
  gemstoneNames,
  xrayMode,
  designStats,
  isSpinning,
  manualAngle,
  activeCharm,
  selectedBeadIndex,
  setSelectedBeadIndex,
  blueprintMetrics,
  wristMm,
  spinSpeed,
}) => {
  return (
    /* Wrapped to match ExpertAssessment beside it. Previously this returned a
       bare <svg>, so the two halves of the analysis row read as different
       kinds of object — one a card, one a floating graphic. */
    <Panel className="h-full">
      <div className="flex h-full flex-col gap-4">
        <div>
          <h3 className="font-serif text-[20px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">
            Technical blueprint
          </h3>
          <p className="label-micro mt-1">Scale schematic · tap a bead to select</p>
        </div>
        <div className="relative flex-1 rounded-[var(--radius-md)] bg-[var(--color-obsidian-900)] p-2">
    <svg
                  viewBox="0 0 380 380"
                  className="h-full w-full"
                  role="img"
                  aria-label={`Bracelet schematic: ${beads.length} beads, inner fit ${designStats.innerFit.toFixed(1)} millimetres`}
                >
                  <defs>
                    {/* Shadow Filter */}
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.35"/>
                    </filter>
                    
                    {/* Define Dynamic Gradients for Gemstones */}
                    {gemstoneNames.map(name => {
                      const info = GEMSTONE_DB[name];
                      if (!info) return null;
                      return (
                        <radialGradient key={name} id={`grad-${name.replace(/\s+/g, '-')}`} cx="30%" cy="30%" r="70%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8"/>
                          <stop offset="25%" stopColor={info.secondaryHex || info.hex}/>
                          <stop offset="85%" stopColor={info.hex}/>
                          <stop offset="100%" stopColor="#0a0a0c"/>
                        </radialGradient>
                      );
                    })}

                    {/* Diffuse glow highlight gradient */}
                    <radialGradient id="white-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>

                    {/* Pearlescent iridescent ring gradient */}
                    <linearGradient id="iridescent-pearl-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffccd5" />
                      <stop offset="40%" stopColor="#e0f2fe" />
                      <stop offset="70%" stopColor="#fef3c7" />
                      <stop offset="100%" stopColor="#f3e8ff" />
                    </linearGradient>

                    {/* Spacer gradients */}
                    <linearGradient id="grad-steel" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="30%" stopColor="#d1d5db" />
                      <stop offset="60%" stopColor="#6b7280" />
                      <stop offset="100%" stopColor="#1f2937" />
                    </linearGradient>

                    <linearGradient id="grad-gold-plated" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fffae6" />
                      <stop offset="25%" stopColor="#f59e0b" />
                      <stop offset="65%" stopColor="#b45309" />
                      <stop offset="100%" stopColor="#451a03" />
                    </linearGradient>

                    {/* Charm hanging loop */}
                    <linearGradient id="grad-loop" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#555" />
                      <stop offset="50%" stopColor="#fff" />
                      <stop offset="100%" stopColor="#111" />
                    </linearGradient>
                  </defs>

                  {/* Blueprint Tech Mode Grid Elements */}
                  {xrayMode ? (
                    <g opacity="0.8">
                      {/* Compass Circle */}
                      <circle cx="190" cy="190" r="160" fill="none" stroke="#1e293b" strokeWidth="1" />
                      <circle cx="190" cy="190" r="120" fill="none" stroke="#1e293b" strokeWidth="1" />
                      <line x1="190" y1="10" x2="190" y2="370" stroke="#1e293b" strokeWidth="0.5" />
                      <line x1="10" y1="190" x2="370" y2="190" stroke="#1e293b" strokeWidth="0.5" />

                      {/* Wrist Circle */}
                      <circle 
                        cx="190" 
                        cy="190" 
                        r={blueprintMetrics.rWrist * 4} 
                        fill="none" 
                        stroke="#06b6d4" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 2" 
                      />
                      <text x="190" y={190 + (blueprintMetrics.rWrist * 4) + 12} textAnchor="middle" fill="#06b6d4" fontSize="9" fontFamily="monospace">
                        WRIST BOUNDARY: {(wristMm/10).toFixed(1)}cm
                      </text>

                      {/* Comfort Clearance Ring */}
                      <circle 
                        cx="190" 
                        cy="190" 
                        r={blueprintMetrics.rTarget * 4} 
                        fill="none" 
                        stroke="#f59e0b" 
                        strokeWidth="1" 
                        strokeDasharray="2 4" 
                      />
                      <text x="190" y={190 - (blueprintMetrics.rTarget * 4) - 6} textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="monospace">
                        TARGET COMFORT LINE: {designStats.target.toFixed(1)}mm
                      </text>

                      {/* Clearance indicator lines / Gap arrows */}
                      <line 
                        x1="190" 
                        y1={190 - (blueprintMetrics.rWrist * 4)} 
                        x2="190" 
                        y2={190 - (blueprintMetrics.innerBound * 4)} 
                        stroke="#10b981" 
                        strokeWidth="1.5" 
                      />
                      <circle cx="190" cy={190 - (blueprintMetrics.rWrist * 4)} r="2" fill="#06b6d4" />
                      <circle cx="190" cy={190 - (blueprintMetrics.innerBound * 4)} r="2" fill="#10b981" />
                    </g>
                  ) : (
                    // Realistic string trace behind beads
                    <circle cx="190" cy="190" r={(blueprintMetrics.rCenter * 4).toFixed(1)} fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.3" />
                  )}

                  {/* ROTATING ASSEMBLY GROUP */}
                  <g 
                    style={{
                      transform: isSpinning ? undefined : `rotate(${manualAngle}deg)`,
                      transformOrigin: '190px 190px',
                    }}
                    className={isSpinning ? (spinSpeed === 'slow' ? 'animate-spin-slow' : spinSpeed === 'medium' ? 'animate-spin-medium' : 'animate-spin-fast') : ''}
                  >
                    {/* DRAW THE BEADS */}
                    {beads.map((b, idx) => {
                      // Position calculations around the strand ring
                      const numBeads = beads.length;
                      const rCenterPx = blueprintMetrics.rCenter * 4;
                      const beadSizePx = b.size * 2.2; // scale factor to look organic in 380px viewBox
                      
                      // Angle spacing
                      const angle = (idx / numBeads) * 2 * Math.PI - Math.PI / 2;
                      const cx = 190 + rCenterPx * Math.cos(angle);
                      const cy = 190 + rCenterPx * Math.sin(angle);
                      
                      const isSelected = selectedBeadIndex === idx;

                      if (xrayMode) {
                        return (
                          <g 
                            key={b.id} 
                            className="cursor-pointer group"
                            onClick={() => setSelectedBeadIndex(idx)}
                          >
                            {/* Sizing circle */}
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={beadSizePx / 2} 
                              fill="none" 
                              stroke={isSelected ? '#38bdf8' : '#475569'} 
                              strokeWidth="1" 
                            />
                            {/* Crosshair */}
                            <line x1={cx - 3} y1={cy} x2={cx + 3} y2={cy} stroke="#64748b" strokeWidth="0.5" />
                            <line x1={cx} y1={cy - 3} x2={cx} y2={cy + 3} stroke="#64748b" strokeWidth="0.5" />
                            
                            {/* Small Index number */}
                            <text x={cx} y={cy + 3} textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">
                              {idx + 1}
                            </text>
                          </g>
                        );
                      }

                      // Realistic 3D gemstone layout
                      const fillGrad = b.type === 'stone' 
                        ? `url(#grad-${b.name.replace(/\s+/g, '-')})`
                        : b.name.includes('Gold') ? 'url(#grad-gold-plated)' : 'url(#grad-steel)';

                      const r = beadSizePx / 2;

                      return (
                        <g 
                          key={b.id}
                          className="cursor-pointer transition-transform duration-300 hover:scale-110 origin-center"
                          style={{ transformOrigin: `${cx}px ${cy}px` }}
                          onClick={() => setSelectedBeadIndex(idx)}
                        >
                          {/* Drop shadow underneath each sphere */}
                          <circle cx={cx} cy={cy + 3} r={r} fill="#000000" opacity="0.25" filter="url(#shadow)" />
                          
                          {/* Selection glow ring */}
                          {isSelected && (
                            <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#b08d57" strokeWidth="1.5" className="animate-pulse" />
                          )}

                          {b.type === 'stone' ? (
                            <>
                              {/* Core bead sphere */}
                              <circle 
                                cx={cx} 
                                cy={cy} 
                                r={r} 
                                fill={fillGrad}
                                stroke="rgba(0,0,0,0.15)"
                                strokeWidth="0.5"
                              />

                              {/* SPECIAL DETAILED GEMSTONE OVERLAYS */}
                              {b.name === 'Onyx' && (
                                <>
                                  <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r * 0.22} ry={r * 0.12} fill="#ffffff" opacity="0.9" transform={`rotate(-35, ${cx - r * 0.3}, ${cy - r * 0.3})`} />
                                  <ellipse cx={cx + r * 0.35} cy={cy + r * 0.35} rx={r * 0.18} ry={r * 0.08} fill="#ffffff" opacity="0.25" transform={`rotate(-35, ${cx + r * 0.35}, ${cy + r * 0.35})`} />
                                </>
                              )}

                              {b.name === 'Lapis Lazuli' && (
                                <>
                                  {/* Pyrite Gold Flecks */}
                                  <circle cx={cx + r * 0.2} cy={cy - r * 0.4} r="0.8" fill="#ffd700" opacity="0.9" />
                                  <circle cx={cx - r * 0.4} cy={cy + r * 0.1} r="0.6" fill="#ffd700" opacity="0.8" />
                                  <circle cx={cx + r * 0.3} cy={cy + r * 0.3} r="0.9" fill="#ffd700" opacity="0.95" />
                                  <circle cx={cx - r * 0.1} cy={cy - r * 0.1} r="0.5" fill="#ffd700" opacity="0.75" />
                                  <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r * 0.25} ry={r * 0.15} fill="#ffffff" opacity="0.6" transform={`rotate(-35, ${cx - r * 0.3}, ${cy - r * 0.3})`} />
                                </>
                              )}

                              {b.name === 'Jade' && (
                                <>
                                  {/* Translucent waxy veins */}
                                  <path d={`M ${cx - r * 0.7} ${cy + r * 0.3} Q ${cx - r * 0.2} ${cy - r * 0.4} ${cx + r * 0.6} ${cy - r * 0.2}`} fill="none" stroke="#4ade80" strokeWidth="1.2" opacity="0.3" />
                                  <path d={`M ${cx - r * 0.5} ${cy - r * 0.5} Q ${cx + r * 0.1} ${cy + r * 0.4} ${cx + r * 0.7} ${cy + r * 0.1}`} fill="none" stroke="#22c55e" strokeWidth="1.0" opacity="0.25" />
                                  <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r * 0.22} ry={r * 0.12} fill="#ffffff" opacity="0.55" transform={`rotate(-35, ${cx - r * 0.3}, ${cy - r * 0.3})`} />
                                </>
                              )}

                              {b.name === 'Turquoise' && (
                                <>
                                  {/* Complex spiderweb matrix veins */}
                                  <path d={`M ${cx - r * 0.8} ${cy - r * 0.2} Q ${cx - r * 0.1} ${cy - r * 0.1} ${cx + r * 0.8} ${cy + r * 0.3}`} fill="none" stroke="#36220f" strokeWidth="0.8" opacity="0.65" />
                                  <path d={`M ${cx - r * 0.2} ${cy - r * 0.8} Q ${cx + r * 0.2} ${cy + r * 0.1} ${cx - r * 0.4} ${cy + r * 0.8}`} fill="none" stroke="#201409" strokeWidth="0.6" opacity="0.6" />
                                  <line x1={cx - r * 0.4} y1={cy - r * 0.3} x2={cx - r * 0.7} y2={cy - r * 0.7} stroke="#36220f" strokeWidth="0.5" opacity="0.55" />
                                  <line x1={cx + r * 0.3} y1={cy + r * 0.1} x2={cx + r * 0.6} y2={cy + r * 0.5} stroke="#201409" strokeWidth="0.5" opacity="0.55" />
                                  <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r * 0.25} ry={r * 0.15} fill="#ffffff" opacity="0.6" transform={`rotate(-35, ${cx - r * 0.3}, ${cy - r * 0.3})`} />
                                </>
                              )}

                              {b.name === 'Tiger Eye' && (
                                <>
                                  {/* Glowing chatoyant diagonal bands */}
                                  <path d={`M ${cx - r * 0.8} ${cy - r * 0.4} L ${cx + r * 0.4} ${cy + r * 0.8} L ${cx + r * 0.8} ${cy + r * 0.4} L ${cx - r * 0.4} ${cy - r * 0.8} Z`} fill="#f0a825" opacity="0.45" />
                                  <path d={`M ${cx - r * 0.4} ${cy - r * 0.8} L ${cx + r * 0.8} ${cy + r * 0.4} L ${cx + r * 0.6} ${cy + r * 0.6} L ${cx - r * 0.6} ${cy - r * 0.6} Z`} fill="#8e5d10" opacity="0.5" />
                                  <line x1={cx - r * 0.9} y1={cy - r * 0.1} x2={cx + r * 0.1} y2={cy + r * 0.9} stroke="#ffffff" strokeWidth="1.2" opacity="0.25" />
                                  <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r * 0.25} ry={r * 0.15} fill="#ffffff" opacity="0.65" transform={`rotate(-35, ${cx - r * 0.3}, ${cy - r * 0.3})`} />
                                </>
                              )}

                              {b.name === 'Amethyst' && (
                                <>
                                  {/* Crystal inclusion fractures */}
                                  <polyline points={`${cx - r * 0.5},${cy + r * 0.2} ${cx},${cy - r * 0.2} ${cx + r * 0.4},${cy - r * 0.1}`} fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.3" />
                                  <polyline points={`${cx - r * 0.3},${cy - r * 0.4} ${cx - r * 0.1},${cy} ${cx + r * 0.2},${cy + r * 0.4}`} fill="none" stroke="#ffffff" strokeWidth="0.4" opacity="0.25" />
                                  <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r * 0.25} ry={r * 0.15} fill="#ffffff" opacity="0.75" transform={`rotate(-35, ${cx - r * 0.3}, ${cy - r * 0.3})`} />
                                </>
                              )}

                              {b.name === 'Pearl' && (
                                <>
                                  {/* Iridescent halo & soft diffuse glow spotlight */}
                                  <circle cx={cx} cy={cy} r={r * 0.9} fill="none" stroke="url(#iridescent-pearl-ring)" strokeWidth="1.5" opacity="0.4" />
                                  <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.45} fill="url(#white-glow)" opacity="0.8" />
                                </>
                              )}

                              {b.name === 'Citrine' && (
                                <>
                                  {/* Internal crystal facets */}
                                  <polygon points={`${cx},${cy - r} ${cx + r * 0.5},${cy - r * 0.5} ${cx},${cy} ${cx - r * 0.5},${cy - r * 0.5}`} fill="none" stroke="#ffffff" strokeWidth="0.4" opacity="0.25" />
                                  <polygon points={`${cx},${cy + r} ${cx + r * 0.6},${cy + r * 0.3} ${cx},${cy} ${cx - r * 0.6},${cy + r * 0.3}`} fill="none" stroke="#ffffff" strokeWidth="0.4" opacity="0.25" />
                                  <line x1={cx - r * 0.5} y1={cy - r * 0.5} x2={cx + r * 0.6} y2={cy + r * 0.3} stroke="#ffffff" strokeWidth="0.4" opacity="0.2" />
                                  <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r * 0.25} ry={r * 0.15} fill="#ffffff" opacity="0.85" transform={`rotate(-35, ${cx - r * 0.3}, ${cy - r * 0.3})`} />
                                </>
                              )}

                              {b.name === 'Carnelian' && (
                                <>
                                  {/* Curved organic growth bands */}
                                  <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`} fill="none" stroke="#f6ad55" strokeWidth="1.2" opacity="0.35" />
                                  <path d={`M ${cx - r * 0.7} ${cy + r * 0.3} A ${r * 0.7} ${r * 0.7} 0 0 1 ${cx + r * 0.3} ${cy - r * 0.7}`} fill="none" stroke="#f08080" strokeWidth="1.0" opacity="0.3" />
                                  <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r * 0.25} ry={r * 0.15} fill="#ffffff" opacity="0.75" transform={`rotate(-35, ${cx - r * 0.3}, ${cy - r * 0.3})`} />
                                </>
                              )}

                              {b.name === 'Rose Quartz' && (
                                <>
                                  {/* Soft foggy internal halo & diffuse highlight */}
                                  <circle cx={cx} cy={cy} r={r * 0.75} fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.25" />
                                  <ellipse cx={cx - r * 0.25} cy={cy - r * 0.25} rx={r * 0.3} ry={r * 0.2} fill="#ffffff" opacity="0.55" transform={`rotate(-35, ${cx - r * 0.25}, ${cy - r * 0.25})`} />
                                </>
                              )}

                              {/* Fallback gloss glow for standard/unspecified gemstones */}
                              {b.name !== 'Onyx' && b.name !== 'Lapis Lazuli' && b.name !== 'Jade' && b.name !== 'Turquoise' && b.name !== 'Tiger Eye' && b.name !== 'Amethyst' && b.name !== 'Pearl' && b.name !== 'Citrine' && b.name !== 'Carnelian' && b.name !== 'Rose Quartz' && (
                                <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r * 0.25} ry={r * 0.15} fill="#ffffff" opacity="0.65" transform={`rotate(-35, ${cx - r * 0.3}, ${cy - r * 0.3})`} />
                              )}
                            </>
                          ) : (
                            <>
                              {/* Realistic physical grooved spacer layout */}
                              <rect 
                                x={cx - r} 
                                y={cy - r * 0.65} 
                                width={r * 2} 
                                height={r * 1.3} 
                                rx={1.5} 
                                fill={fillGrad} 
                                stroke="rgba(0,0,0,0.25)" 
                                strokeWidth="0.5" 
                              />
                              {/* High-end metallic polish highlights and ridges */}
                              <line x1={cx - r * 0.5} y1={cy - r * 0.65} x2={cx - r * 0.5} y2={cy + r * 0.65} stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
                              <line x1={cx} y1={cy - r * 0.65} x2={cx} y2={cy + r * 0.65} stroke="rgba(255,255,255,0.55)" strokeWidth="1.0" />
                              <line x1={cx + r * 0.5} y1={cy - r * 0.65} x2={cx + r * 0.5} y2={cy + r * 0.65} stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
                              <circle cx={cx} cy={cy} r="1.5" fill="#111115" opacity="0.85" />
                            </>
                          )}
                        </g>
                      );
                    })}

                    {/* HANGING CHARM */}
                    {activeCharm && (
                      (() => {
                        // Anchor charm at the bottom center (opposite knot point at top center)
                        const rCenterPx = blueprintMetrics.rCenter * 4;
                        const charmSizePx = activeCharm.size * 2.5;
                        const cx = 190;
                        const cy = 190 + rCenterPx;

                        if (xrayMode) {
                          return (
                            <g>
                              <circle cx={cx} cy={cy + 10} r={charmSizePx / 2} fill="none" stroke="#ef4444" strokeWidth="1" />
                              <line x1={cx} y1={cy} x2={cx} y2={cy + 10} stroke="#ef4444" strokeWidth="1" strokeDasharray="1 1" />
                              <text x={cx} y={cy + 22} textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="monospace">
                                CHARM ATTACH: {activeCharm.name.toUpperCase()}
                              </text>
                            </g>
                          );
                        }

                        return (
                          <g>
                            {/* Drop shadow */}
                            <circle cx={cx} cy={cy + 14} r={charmSizePx / 2} fill="#000000" opacity="0.18" filter="url(#shadow)" />

                            {/* Connector gold loop */}
                            <line x1={cx} y1={cy} x2={cx} y2={cy + 8} stroke="url(#grad-gold-plated)" strokeWidth="2.2" />
                            <circle cx={cx} cy={cy + 5} r="3" fill="none" stroke="url(#grad-gold-plated)" strokeWidth="1.8" />
                            
                            {/* Main charm body */}
                            <circle cx={cx} cy={cy + 14} r={charmSizePx / 2} fill={activeCharm.hex} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
                            {/* Inner gold highlight or metallic accent stop */}
                            {activeCharm.secondaryHex && (
                              <circle cx={cx} cy={cy + 14} r={charmSizePx / 3.2} fill={activeCharm.secondaryHex} opacity="0.9" />
                            )}
                            {/* specular highlight */}
                            <ellipse cx={cx - charmSizePx/6} cy={cy + 14 - charmSizePx/6} rx={charmSizePx / 6} ry={charmSizePx / 10} fill="#ffffff" opacity="0.7" transform={`rotate(-35, ${cx - charmSizePx/6}, ${cy + 14 - charmSizePx/6})`} />
                          </g>
                        );
                      })()
                    )}
                  </g>

                  {/* Inner technical measurements readout in middle */}
                  <g>
                    {/* 9px was below the readable floor for a value this
                        important; raised and given a lighter tracking so the
                        figure reads as a headline rather than a caption. */}
                    <text x="190" y="178" textAnchor="middle" className={`font-mono text-[11px] uppercase tracking-[0.16em] ${
                      xrayMode ? 'fill-slate-300' : 'fill-obsidian-500'
                    }`}>
                      Inner fit
                    </text>
                    <text x="190" y="204" textAnchor="middle" className={`font-sans text-[26px] font-semibold tracking-tight ${
                      xrayMode ? 'fill-white' : 'fill-obsidian-900'
                    }`}>
                      {designStats.innerFit.toFixed(1)}mm
                    </text>
                    {/* Light-on-dark variants. The --color-success-fg /
                        --color-warning-fg tokens are tuned for the paper
                        surface and drop to ~2.9:1 against this dark panel. */}
                    <text x="190" y="222" textAnchor="middle" className={`font-mono text-[11px] font-semibold tracking-[0.08em] ${
                      designStats.status === 'perfect' ? 'fill-[#6ee7b7]' : 'fill-[#fcd34d]'
                    }`}>
                      {designStats.discrepancy >= 0 ? '+' : ''}{designStats.discrepancy.toFixed(1)}mm gap
                    </text>
                  </g>
                </svg>
        </div>
      </div>
    </Panel>
  );
};
