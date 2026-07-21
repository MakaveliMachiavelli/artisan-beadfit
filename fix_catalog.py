with open('src/data.ts', 'r') as f:
    content = f.read()

import re

new_func = """export function generateDefaultCatalog(): CatalogItem[] {
  const catalog: CatalogItem[] = [];

  // Generate gemstone catalog
  Object.entries(GEMSTONE_DB).forEach(([name, info]) => {
    SIZES.forEach(size => {
      // Base premium cost multiplier based on gem rarity
      let multiplier = 1.0;
      if (name === 'Lapis Lazuli') multiplier = 1.6;
      if (name === 'Jade') multiplier = 1.8;
      if (name === 'Turquoise') multiplier = 1.5;
      if (name === 'Amethyst') multiplier = 1.3;
      if (name === 'Citrine') multiplier = 1.4;
      if (name === 'Pearl') multiplier = 1.4;

      const isRare = RARE_SIZES.includes(size);
      const cost = Math.round(SIZE_TIER_COST[size] * multiplier * 10) / 10;
      const stock = isRare ? (size === 2 ? 15 : 25) : 300;

      catalog.push({
        id: `stone-${name.toLowerCase().replace(/\\s+/g, '-')}-${size}`,
        type: 'stone',
        name,
        material: 'Natural Gemstone',
        quality: isRare ? 'Collectors Grade' : 'Standard Grade',
        size,
        lengthMm: size,
        hex: info.hex,
        secondaryHex: info.secondaryHex,
        meaning: info.meaning,
        cost,
        rare: isRare,
        stock
      });
    });
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
}"""

# Use simple string replacement for reliability, find the start and end indices
start_idx = content.find("export function generateDefaultCatalog(): CatalogItem[] {")
end_idx = content.find("export const DESIGN_PRESETS: DesignPreset[] = [")

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_func + "\n\n" + content[end_idx:]

with open('src/data.ts', 'w') as f:
    f.write(content)
