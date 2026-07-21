import { describe, it, expect } from 'vitest';
import { calculateBlueprintMetrics, calculateInnerFit, calculateBeadCountForCircumference } from './geometry';

describe('Geometry Utilities', () => {
  describe('calculateBlueprintMetrics', () => {
    it('calculates the correct blueprint metrics given valid inputs', () => {
      const wristMm = 150;
      const targetMm = 160;
      const avgBeadSize = 8;
      
      const metrics = calculateBlueprintMetrics(wristMm, targetMm, avgBeadSize);
      
      expect(metrics.rWrist).toBeCloseTo(wristMm / (2 * Math.PI), 5);
      expect(metrics.rTarget).toBeCloseTo(targetMm / (2 * Math.PI), 5);
      
      const expectedRCenter = metrics.rWrist + (avgBeadSize / 2);
      expect(metrics.rCenter).toBeCloseTo(expectedRCenter, 5);
      
      const expectedInnerBound = metrics.rCenter - (avgBeadSize / 2);
      expect(metrics.innerBound).toBeCloseTo(expectedInnerBound, 5);
      
      expect(metrics.physicalGap).toBeCloseTo(expectedInnerBound - metrics.rWrist, 5);
    });

    it('handles zero values appropriately', () => {
      const metrics = calculateBlueprintMetrics(0, 0, 0);
      expect(metrics.rWrist).toBe(0);
      expect(metrics.rTarget).toBe(0);
      expect(metrics.rCenter).toBe(0);
      expect(metrics.innerBound).toBe(0);
      expect(metrics.physicalGap).toBe(0);
    });
  });

  describe('calculateInnerFit', () => {
    it('calculates inner fit correctly based on bead length and avg size', () => {
      // Test case: 20 beads of 8mm = 160mm total length
      const length = 160;
      const size = 8;
      // innerFit = 160 - PI * 8 = 160 - 25.1327 = 134.867
      const result = calculateInnerFit(length, size);
      expect(result).toBeCloseTo(160 - Math.PI * 8, 5);
    });

    it('returns 0 for zero inputs', () => {
      expect(calculateInnerFit(0, 0)).toBe(0);
      expect(calculateInnerFit(160, 0)).toBe(0);
      expect(calculateInnerFit(0, 8)).toBe(0);
    });
  });

  describe('calculateBeadCountForCircumference', () => {
    it('calculates the exact theoretical number of beads', () => {
      // formula: (targetMm + Math.PI * beadSize) / beadSize
      const targetMm = 150;
      const beadSize = 8;
      const result = calculateBeadCountForCircumference(targetMm, beadSize);
      expect(result).toBeCloseTo((150 + Math.PI * 8) / 8, 5);
    });

    it('returns 0 for zero or negative bead sizes', () => {
      expect(calculateBeadCountForCircumference(150, 0)).toBe(0);
      expect(calculateBeadCountForCircumference(150, -5)).toBe(0);
    });
  });
});
