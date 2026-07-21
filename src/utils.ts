import { BeadInstance, CatalogItem, GemstoneInfo } from './types';
import { GEMSTONE_DB } from './data';

import { calculateBeadCountForCircumference } from './geometry';
import { buildMirroredSequence } from './symmetry';

interface EnergyScores {
  protection: number;
  clarity: number;
  abundance: number;
  calm: number;
  love: number;
  vitality: number;
}

export function analyzeBeadDesign(
  beads: BeadInstance[],
  wristMm: number,
  easeMm: number
): {
  energies: EnergyScores;
  expertVerdict: string;
  colorHarmony: string;
  hardnessWarning?: string;
} {
  const energies: EnergyScores = {
    protection: 0,
    clarity: 0,
    abundance: 0,
    calm: 0,
    love: 0,
    vitality: 0
  };

  if (beads.length === 0) {
    return {
      energies,
      expertVerdict: 'A blank canvas holds infinite potential. Select a preset or tap beads above to begin crafting your energetic signature.',
      colorHarmony: 'Undecided'
    };
  }

  // Calculate energetic attributes
  let stoneCount = 0;
  const uniqueStones = new Set<string>();
  const hardnesses: number[] = [];

  beads.forEach(b => {
    const info = GEMSTONE_DB[b.name];
    if (info) {
      stoneCount++;
      uniqueStones.add(b.name);
      if (info.mohsHardness) hardnesses.push(info.mohsHardness);

      // Add properties weighted by bead volume proportional to its diameter
      const weight = b.size; // larger beads have more material/presence
      if (info.properties.protection) energies.protection += info.properties.protection * weight;
      if (info.properties.clarity) energies.clarity += info.properties.clarity * weight;
      if (info.properties.abundance) energies.abundance += info.properties.abundance * weight;
      if (info.properties.calm) energies.calm += info.properties.calm * weight;
      if (info.properties.love) energies.love += info.properties.love * weight;
      if (info.properties.vitality) energies.vitality += info.properties.vitality * weight;
    }
  });

  // Normalize scores to percentages
  const sumScores = Object.values(energies).reduce((a, b) => a + b, 0);
  if (sumScores > 0) {
    Object.keys(energies).forEach(k => {
      const key = k as keyof EnergyScores;
      energies[key] = Math.round((energies[key] / sumScores) * 100);
    });
  }

  // Determine design characteristics
  const stoneList = Array.from(uniqueStones);
  let expertVerdict = '';
  let colorHarmony = 'Polychrome';

  // 1. Color harmony determination
  if (stoneList.length === 1) {
    colorHarmony = `Monochrome ${stoneList[0]}`;
  } else if (stoneList.length === 2) {
    colorHarmony = `Complementary ${stoneList[0]} & ${stoneList[1]}`;
  } else if (stoneList.length >= 3) {
    colorHarmony = 'Symphonic Gemstone Blend';
  }

  // 2. Generate rich literary verdict
  const wristCm = (wristMm / 10).toFixed(1);
  const comfortText = easeMm === 3 ? 'snug' : easeMm === 12 ? 'relaxed' : 'standard';

  if (stoneList.length === 0) {
    expertVerdict = `A clean accent layout. Ideal as a modern structural grounding piece for your ${wristCm}cm wrist.`;
  } else if (stoneList.length === 1) {
    const sName = stoneList[0];
    const info = GEMSTONE_DB[sName];
    expertVerdict = `A focused, high-vibrational choice. By keeping the design dedicated solely to ${sName}, you amplify its primary virtue: "${info?.meaning}". Spaced perfectly for your ${wristCm}cm wrist, it maintains a pure, uninterrupted flow of singular mineral energy.`;
  } else {
    // Multi-stone synergies
    const hasProtection = energies.protection > 25;
    const hasAbundance = energies.abundance > 25;
    const hasCalm = energies.calm > 25;
    const hasLove = energies.love > 25;
    const hasVitality = energies.vitality > 25;

    if (hasProtection && hasAbundance) {
      expertVerdict = `An exquisite sovereign alignment. The grounding, shielding nature of Onyx or Turquoise provides a stable anchor, allowing the prosperous abundance energies of Jade or Citrine to flourish freely without energetic drainage. Excellent for leadership and high-stakes settings.`;
    } else if (hasCalm && hasLove) {
      expertVerdict = `A beautiful, soothing sanctuary of the heart. Pairing tender emotional healing stones (like Rose Quartz) with deep spiritual tranquilizers (like Amethyst or Pearl) creates a nurturing aura. It gently quietens the nervous system and fosters deep reconciliation and grace.`;
    } else if (hasVitality && hasAbundance) {
      expertVerdict = `A highly magnetic, action-oriented design. The creative drive and stamina of Carnelian or Tiger Eye acts as the engine, while Citrine or Jade guides that momentum toward prosperity. This layout invites high confidence, wealth manifestation, and rapid creative breakthroughs.`;
    } else if (hasProtection && hasCalm) {
      expertVerdict = `The ultimate sanctuary shield. This combination grounds your active aura while keeping stress and ambient anxiety completely at bay. Perfect for sensitive individuals, empaths, or those seeking deep, restorative tranquility in crowded spaces.`;
    } else {
      // General multi-blend
      expertVerdict = `A highly complex, custom mineral matrix. By combining ${stoneList.slice(0, 3).join(', ')}${stoneList.length > 3 ? ' and others' : ''}, you have engineered a balanced ecosystem of energies. The alternating polarities of these gemstones create a versatile charm suited for your ${wristCm}cm wrist at a ${comfortText} fit.`;
    }
  }

  // 3. Physical durability check (gem hardness disparities)
  let hardnessWarning;
  if (hardnesses.length > 1) {
    const minH = Math.min(...hardnesses);
    const maxH = Math.max(...hardnesses);
    if (maxH - minH >= 3.0) {
      const softGem = stoneList.find(s => GEMSTONE_DB[s]?.mohsHardness === minH);
      const hardGem = stoneList.find(s => GEMSTONE_DB[s]?.mohsHardness === maxH);
      hardnessWarning = `Care advice: Your design pairs ${hardGem} (Hardness ${maxH}) with ${softGem} (Hardness ${minH}). Soft gemstones can scratch when rubbed against harder quartz-group gems over time. Consider wiping gently with a soft microfiber cloth.`;
    }
  }

  return {
    energies,
    expertVerdict,
    colorHarmony,
    hardnessWarning
  };
}

/**
 * Intelligent "Golden Ratio" Layout Auto-Styling Engine
 * Creates a symmetrical, mathematically balanced sequence based on color-theory harmonies
 * and perfect bilateral reflection symmetry, mimicking luxury artisan jewelry houses.
 */
export function generateGoldenRatioSequence(
  mainItem: CatalogItem,
  accentItem: CatalogItem | null,
  charmItem: CatalogItem | null,
  targetCircumference: number,
  catalog: CatalogItem[]
): CatalogItem[] {
  const mainSize = mainItem.size;
  // Sizing formula: InnerFit = total_length - PI * average_size = Target
  const exactCount = calculateBeadCountForCircumference(targetCircumference, mainSize);
  let totalBeads = Math.round(exactCount);
  
  // Ensure we have an even number of beads for perfect bilateral mirror reflection!
  if (totalBeads < 14) totalBeads = 14;
  if (totalBeads % 2 !== 0) totalBeads++;

  // --- COLOR THEORY COMPLEMENTS MAP ---
  // Connects each gemstone to its perfect energetic & visual color complement.
  const HARMONY_MAP: Record<string, { complement: string; spacerMaterial: 'Gold' | 'Steel' }> = {
    'Lapis Lazuli': { complement: 'Citrine', spacerMaterial: 'Gold' },
    'Jade': { complement: 'Tiger Eye', spacerMaterial: 'Gold' },
    'Amethyst': { complement: 'Pearl', spacerMaterial: 'Steel' },
    'Onyx': { complement: 'Carnelian', spacerMaterial: 'Gold' },
    'Turquoise': { complement: 'Onyx', spacerMaterial: 'Steel' },
    'Rose Quartz': { complement: 'Pearl', spacerMaterial: 'Gold' },
    'Carnelian': { complement: 'Onyx', spacerMaterial: 'Gold' },
    'Tiger Eye': { complement: 'Citrine', spacerMaterial: 'Gold' },
    'Citrine': { complement: 'Jade', spacerMaterial: 'Gold' },
    'Pearl': { complement: 'Rose Quartz', spacerMaterial: 'Gold' }
  };

  const pairing = HARMONY_MAP[mainItem.name] || { complement: 'Onyx', spacerMaterial: 'Gold' };
  
  // Find the companion gemstone in the catalog (same size and quality if possible)
  const compItem = catalog.find(
    i => i.type === 'stone' && i.name === pairing.complement && i.size === mainItem.size && i.quality === mainItem.quality
  ) || catalog.find(
    i => i.type === 'stone' && i.name === pairing.complement && i.size === mainItem.size
  ) || catalog.find(
    i => i.type === 'stone' && i.name === pairing.complement
  ) || mainItem;

  // Find the perfect metallic spacer for this palette
  const matKeyword = pairing.spacerMaterial === 'Gold' ? 'Gold Plated' : 'Stainless';
  const idealSpacer = catalog.find(
    i => i.type === 'spacer' && i.name.includes(matKeyword) && i.size === 4
  ) || catalog.find(
    i => i.type === 'spacer' && i.name.includes(matKeyword)
  ) || accentItem || catalog.find(
    i => i.type === 'spacer'
  ) || mainItem;

  // Build a bilateral mirrored layout on one half, then reflect it
  const halfSize = totalBeads / 2;
  const halfSequence: CatalogItem[] = [];

  // Index 0 is the knot point at the top center.
  // Index halfSize is the focal point at the bottom center (where the charm hangs).
  // We want to frame the focal point beautifully with spacers and complements.
  for (let i = 0; i < halfSize; i++) {
    if (i === 0) {
      // Knot anchor spacer
      halfSequence.push(idealSpacer);
    } else if (i === halfSize - 1) {
      // Framing spacer right next to the center-bottom charm / focal point
      halfSequence.push(idealSpacer);
    } else if (i === Math.floor(halfSize / 2)) {
      // Complementary gem exactly at the 90-degree midpoint (flanks)
      halfSequence.push(compItem);
    } else if (i === Math.floor(halfSize / 2) - 1 || i === Math.floor(halfSize / 2) + 1) {
      // Spacers sandwiching the complementary gemstone
      halfSequence.push(idealSpacer);
    } else {
      // Primary gemstone fills the remaining rest of the strand
      halfSequence.push(mainItem);
    }
  }

  return buildMirroredSequence(halfSequence);
}
