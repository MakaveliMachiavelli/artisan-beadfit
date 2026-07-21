import { BeadInstance } from './types';
import { calculateInnerFit } from './geometry';

export interface BraceletFitStats {
  totalBeadLength: number;
  avgBeadSize: number;
  innerFit: number;
  targetMm: number;
  discrepancy: number;
  status: 'perfect' | 'tight' | 'loose';
}

export function calculateBraceletFit(
  beads: BeadInstance[],
  wristMm: number,
  ease: number
): BraceletFitStats {
  const totalBeadLength = beads.reduce((sum, b) => sum + b.lengthMm, 0);
  const avgBeadSize = beads.length > 0 ? beads.reduce((sum, b) => sum + b.size, 0) / beads.length : 0;
  
  // Sizing mathematics: 
  // innerFit = Total bead outer length - pi * average bead diameter
  const calculatedInnerFit = calculateInnerFit(totalBeadLength, avgBeadSize);
  const targetMm = wristMm + ease;
  const discrepancy = calculatedInnerFit - targetMm;
  
  // Fit status
  let status: 'perfect' | 'tight' | 'loose' = 'perfect';
  if (discrepancy < -2.0) status = 'tight';
  else if (discrepancy > 2.5) status = 'loose';

  return {
    totalBeadLength,
    avgBeadSize,
    innerFit: calculatedInnerFit,
    targetMm,
    discrepancy,
    status
  };
}
