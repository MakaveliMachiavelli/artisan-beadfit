import re

with open('src/data.ts', 'r') as f:
    content = f.read()

# 1. Add Coral Jade to GEMSTONE_DB
coral_jade_db = """export const GEMSTONE_DB: Record<string, GemstoneInfo> = {
  'Coral Jade': {
    name: 'Coral Jade',
    hex: '#e5d3b3',
    secondaryHex: '#a08873',
    meaning: 'Vitality, Healing & Grounding',
    filipinoMeaning: 'Kasiglahan, paghilom, at katatagan',
    description: 'A fossilized coral turned to chalcedony. It carries the energy of the ocean and the earth, promoting healing, vitality, and groundedness.',
    properties: { vitality: 80, calm: 70, protection: 60 },
    mineralGroup: 'Fossilized Coral (Silica)',
    mohsHardness: 6.5
  },"""

content = content.replace("export const GEMSTONE_DB: Record<string, GemstoneInfo> = {", coral_jade_db)

# 2. Add Coral Jade specific items and a Preset
# Find generateDefaultCatalog end
catalog_addition = """
  // Add specific shaped beads
  catalog.push({
    id: 'stone-coral-jade-cube-8',
    type: 'stone',
    name: 'Coral Jade Cube',
    material: 'Natural Gemstone',
    quality: 'Standard Grade',
    size: 8,
    lengthMm: 8,
    hex: '#e5d3b3',
    secondaryHex: '#a08873',
    meaning: 'Vitality, Healing & Grounding',
    cost: 45,
    rare: false,
    stock: 100
  });

  catalog.push({
    id: 'stone-coral-jade-heart-12',
    type: 'stone',
    name: 'Coral Jade Heart',
    material: 'Natural Gemstone',
    quality: 'Premium Grade',
    size: 12,
    lengthMm: 12,
    hex: '#e5d3b3',
    secondaryHex: '#c86450', // reddish hint
    meaning: 'Vitality, Healing & Grounding',
    cost: 120,
    rare: true,
    stock: 20
  });

  // Add small Jade spacers to catalog
  catalog.push({
    id: 'stone-jade-spacer-6',
    type: 'stone',
    name: 'Jade Spacer',
    material: 'Natural Gemstone',
    quality: 'Standard Grade',
    size: 6,
    lengthMm: 6,
    hex: '#1b4b36',
    secondaryHex: '#3b7d5d',
    meaning: 'Prosperity, Harmony & Good Fortune',
    cost: 25,
    rare: false,
    stock: 300
  });

  return catalog;
"""
content = content.replace("  return catalog;\n}", catalog_addition + "}")

# 3. Add Preset
preset_addition = """export const DESIGN_PRESETS: DesignPreset[] = [
  {
    name: 'Coral Jade Fossil',
    sub: 'Kasiglahan & Katatagan (Sample)',
    size: 8,
    pattern: [
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Heart', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer',
      'Coral Jade Cube', 'Jade Spacer'
    ]
  },"""
content = content.replace("export const DESIGN_PRESETS: DesignPreset[] = [", preset_addition)

with open('src/data.ts', 'w') as f:
    f.write(content)
