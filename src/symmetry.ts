import { BeadInstance } from './types';

/**
 * Injects a focal word perfectly centered at the bottom of the bracelet (the focal point).
 * This maintains bilateral symmetry around the letters.
 * Deterministic: ID generation is based on character index and letter.
 */
export function injectFocalWord(
  baseBeads: BeadInstance[],
  word: string,
  style: string,
  costPerLetter: number = 50,
  idPrefix: string = 'letter'
): BeadInstance[] {
  const nonLetters = baseBeads.filter(b => b.type !== 'letter');
  if (!word) return nonLetters;

  const letters: BeadInstance[] = word.toUpperCase().split('').map((char, i) => ({
    id: `${idPrefix}-${i}-${char}`,
    itemId: 'letter-bead',
    type: 'letter',
    name: `Letter ${char}`,
    size: 7,
    lengthMm: 7,
    hex: style === 'black-white' ? '#111111' : (style === 'gold-metal' ? '#f59e0b' : '#ffffff'),
    cost: costPerLetter,
    letter: char,
    letterStyle: style,
  }));

  const mid = Math.floor(nonLetters.length / 2);
  return [
    ...nonLetters.slice(0, mid),
    ...letters,
    ...nonLetters.slice(mid)
  ];
}

/**
 * Builds a full, bilaterally mirrored sequence from a half-sequence.
 * Left side: from knot (index 0) to bottom.
 * Right side: mirrored reflection back up to the knot.
 */
export function buildMirroredSequence<T>(halfSequence: T[]): T[] {
  const fullSequence: T[] = [];
  
  // Left side
  for (let i = 0; i < halfSequence.length; i++) {
    fullSequence.push(halfSequence[i]);
  }
  
  // Right side: mirrored reflection
  for (let i = halfSequence.length - 1; i >= 0; i--) {
    fullSequence.push(halfSequence[i]);
  }
  
  return fullSequence;
}

/**
 * Validates if a sequence is perfectly bilaterally mirrored.
 */
export function validateMirroredSymmetry<T>(
  sequence: T[],
  isEqual: (a: T, b: T) => boolean
): boolean {
  if (sequence.length % 2 !== 0) {
    return false; // Perfect bilateral symmetry requires an even number of elements
  }
  const half = sequence.length / 2;
  for (let i = 0; i < half; i++) {
    const left = sequence[i];
    const right = sequence[sequence.length - 1 - i];
    if (!isEqual(left, right)) {
      return false;
    }
  }
  return true;
}

/**
 * Adds a bead to the sequence in a balanced way (either at the knot or the focal point).
 * Alternates based on the iteration count to maintain overall symmetry.
 */
export function addBeadSymmetrically(
  beads: BeadInstance[],
  newBead: BeadInstance,
  iteration: number
): BeadInstance[] {
  const result = [...beads];
  let addIndex = iteration % 2 === 0 ? 0 : Math.floor(result.length / 2);
  
  // Skip over letters to maintain focal alignment
  while (addIndex < result.length && result[addIndex].type === 'letter') {
    addIndex++;
  }
  
  result.splice(addIndex, 0, newBead);
  return result;
}

/**
 * Removes a bead from the sequence in a balanced way.
 * For now, this removes the first non-letter stone it finds.
 */
export function removeBeadSymmetrically(
  beads: BeadInstance[]
): BeadInstance[] {
  const result = [...beads];
  const removeIndex = result.findIndex(b => b.type === 'stone');
  if (removeIndex !== -1) {
    result.splice(removeIndex, 1);
  } else {
    // If no stone found, just remove the first bead to prevent infinite loop
    result.splice(0, 1);
  }
  return result;
}

/**
 * Validates a bracelet sequence.
 * Ensures minimum structural constraints are met.
 */
export function validateBraceletSequence(beads: BeadInstance[]): { valid: boolean; reason?: string } {
  if (beads.length < 6) {
    return { valid: false, reason: 'Minimum 6 beads required to maintain structure.' };
  }
  return { valid: true };
}
