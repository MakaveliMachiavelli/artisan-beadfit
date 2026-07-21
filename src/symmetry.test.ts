import { describe, it, expect } from 'vitest';
import {
  injectFocalWord,
  buildMirroredSequence,
  validateMirroredSymmetry,
  addBeadSymmetrically,
  removeBeadSymmetrically,
  validateBraceletSequence
} from './symmetry';
import { BeadInstance } from './types';

describe('Symmetry Utilities', () => {
  const mockBead = (name: string): BeadInstance => ({
    id: `id-${name}`,
    itemId: `item-${name}`,
    type: 'stone',
    name,
    quality: 'AAA',
    size: 8,
    lengthMm: 8,
    hex: '#000000',
    cost: 10
  });

  describe('injectFocalWord', () => {
    it('injects letters symmetrically at the focal point', () => {
      const beads = [mockBead('A'), mockBead('B'), mockBead('C'), mockBead('D')];
      const result = injectFocalWord(beads, 'HI', 'black-white', 50, 'test');
      
      expect(result.length).toBe(6);
      expect(result[0].name).toBe('A');
      expect(result[1].name).toBe('B');
      expect(result[2].name).toBe('Letter H');
      expect(result[3].name).toBe('Letter I');
      expect(result[4].name).toBe('C');
      expect(result[5].name).toBe('D');
    });

    it('returns non-letters if word is empty', () => {
      const beads = [mockBead('A'), mockBead('B')];
      const result = injectFocalWord(beads, '', 'black-white');
      expect(result.length).toBe(2);
    });
  });

  describe('buildMirroredSequence', () => {
    it('mirrors a half sequence correctly', () => {
      const half = [1, 2, 3];
      const result = buildMirroredSequence(half);
      expect(result).toEqual([1, 2, 3, 3, 2, 1]);
    });
  });

  describe('validateMirroredSymmetry', () => {
    it('returns true for a mirrored sequence', () => {
      const seq = [1, 2, 3, 3, 2, 1];
      expect(validateMirroredSymmetry(seq, (a, b) => a === b)).toBe(true);
    });

    it('returns false for an unmirrored sequence', () => {
      const seq = [1, 2, 3, 1, 2, 3];
      expect(validateMirroredSymmetry(seq, (a, b) => a === b)).toBe(false);
    });

    it('returns false for odd length sequences', () => {
      const seq = [1, 2, 1];
      expect(validateMirroredSymmetry(seq, (a, b) => a === b)).toBe(false);
    });
  });

  describe('addBeadSymmetrically', () => {
    it('adds at index 0 for even iterations', () => {
      const beads = [mockBead('A'), mockBead('B')];
      const result = addBeadSymmetrically(beads, mockBead('New'), 0);
      expect(result[0].name).toBe('New');
    });

    it('adds at the middle for odd iterations', () => {
      const beads = [mockBead('A'), mockBead('B')];
      const result = addBeadSymmetrically(beads, mockBead('New'), 1);
      expect(result[1].name).toBe('New');
    });
  });

  describe('removeBeadSymmetrically', () => {
    it('removes the first stone found', () => {
      const beads = [{ ...mockBead('Letter A'), type: 'letter' as any }, mockBead('Stone B')];
      const result = removeBeadSymmetrically(beads);
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('letter');
    });
  });

  describe('validateBraceletSequence', () => {
    it('returns valid for 6 or more beads', () => {
      const beads = new Array(6).fill(mockBead('A'));
      expect(validateBraceletSequence(beads).valid).toBe(true);
    });

    it('returns invalid for less than 6 beads', () => {
      const beads = new Array(5).fill(mockBead('A'));
      const result = validateBraceletSequence(beads);
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });
});
