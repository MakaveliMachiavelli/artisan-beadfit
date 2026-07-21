import { BeadInstance } from './types';
import { calculateInnerFit } from './geometry';

/**
 * Wrist bounds, shared by every control that reads or writes wristMm.
 *
 * These previously disagreed across three call sites: StudioPage clamped
 * 110-230, FitCalibrationPanel clamped 130-230, and the range input ran
 * 130-220. Typing 120 therefore produced a value the slider could not
 * represent, and the two controls reported different maxima.
 *
 * Declared here (an eagerly-imported module) rather than in the panel, so
 * importing them does not pull the lazy panel chunk into the initial bundle.
 */
export const WRIST_MIN_MM = 130;
export const WRIST_MAX_MM = 220;

export const clampWristMm = (mm: number) =>
  Math.round(Math.min(WRIST_MAX_MM, Math.max(WRIST_MIN_MM, mm)));

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
