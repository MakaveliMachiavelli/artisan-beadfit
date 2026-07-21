import { GemstoneInfo, CatalogItem, DesignPreset, AddonOption, Voucher } from './types';

export const GEMSTONE_DB: Record<string, GemstoneInfo> = {
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
  },
  'Onyx': {
    name: 'Onyx',
    hex: '#111112',
    secondaryHex: '#32343a',
    meaning: 'Shielding, Inner Strength & Stamina',
    filipinoMeaning: 'Panangga, tibay ng loob, at lakas laban sa negatibong enerhiya',
    description: 'A powerful protection stone that absorbs and transforms negative energy. It helps prevent the drain of personal energy and supports emotional stamina.',
    properties: { protection: 95, calm: 45, vitality: 60 },
    mineralGroup: 'Chalcedony (Quartz)',
    mohsHardness: 7.0
  },
  'Lapis Lazuli': {
    name: 'Lapis Lazuli',
    hex: '#102a5e',
    secondaryHex: '#254e9e',
    meaning: 'Wisdom, Deep Intuition & Clarity',
    filipinoMeaning: 'Karunungan, talas ng isip, at malalim na koneksyon sa katotohanan',
    description: 'The stone of truth and royalty. Highly sought after for its deep celestial blue dusted with golden flecks of Pyrite, boosting intellectual capacity and intuition.',
    properties: { clarity: 90, protection: 50, calm: 40 },
    mineralGroup: 'Sodalite-rich rock',
    mohsHardness: 5.5
  },
  'Jade': {
    name: 'Jade',
    hex: '#1b4b36',
    secondaryHex: '#3b7d5d',
    meaning: 'Prosperity, Harmony & Good Fortune',
    filipinoMeaning: 'Suwerte, kapayapaan, kasaganaan, at kalusugan',
    description: 'An ancient talisman of wealth and longevity. It balances emotional states, attracts auspicious abundance, and instills a deep sense of tranquil wellbeing.',
    properties: { abundance: 95, calm: 60, love: 40 },
    mineralGroup: 'Nephrite / Jadeite',
    mohsHardness: 6.5
  },
  'Turquoise': {
    name: 'Turquoise',
    hex: '#1fa2a6',
    secondaryHex: '#4fd1c5',
    meaning: 'Wholeness, Protection & Journey Healing',
    filipinoMeaning: 'Ligtas na paglalakbay, kagalingan, at malayang pakikipag-ugnayan',
    description: 'A legendary master healer prized across cultures. It provides a secure spiritual shield, bridges earth and sky energy, and fosters honest creative communication.',
    properties: { protection: 85, clarity: 60, calm: 50 },
    mineralGroup: 'Phosphate mineral',
    mohsHardness: 6.0
  },
  'Amethyst': {
    name: 'Amethyst',
    hex: '#3f2b6e',
    secondaryHex: '#7f59b3',
    meaning: 'Spiritual Serenity, Stress Relief & Sleep',
    filipinoMeaning: 'Katahimikan ng isip, mahimbing na tulog, at pagbawas sa stress',
    description: 'A natural tranquilizer that transmutes anger, rage, and anxiety. It opens spiritual crown channels and brings sublime meditative clarity.',
    properties: { calm: 95, clarity: 70, protection: 40 },
    mineralGroup: 'Macrocrystalline Quartz',
    mohsHardness: 7.0
  },
  'Rose Quartz': {
    name: 'Rose Quartz',
    hex: '#f5ccd3',
    secondaryHex: '#fceede',
    meaning: 'Unconditional Love, Tenderness & Reconciliation',
    filipinoMeaning: 'Wagas na pagmamahal, kapatawaran, at paghilom ng damdamin',
    description: 'The classic stone of the heart. It radiates soft, compassionate pink frequencies that encourage self-love, heal old heartaches, and invite peaceful relationships.',
    properties: { love: 95, calm: 70, abundance: 30 },
    mineralGroup: 'Macrocrystalline Quartz',
    mohsHardness: 7.0
  },
  'Carnelian': {
    name: 'Carnelian',
    hex: '#962b18',
    secondaryHex: '#e06b20',
    meaning: 'Vitality, Courage & Creative Impulse',
    filipinoMeaning: 'Tapang, tiwala sa sarili, talino, at walang-katapusang sigla',
    description: 'A high-energy mineral that stimulates the sacral core. It banishes apathy, fuels action, sparks creative projects, and helps you trust your decisions.',
    properties: { vitality: 95, abundance: 60, clarity: 30 },
    mineralGroup: 'Chalcedony (Quartz)',
    mohsHardness: 7.0
  },
  'Tiger Eye': {
    name: 'Tiger Eye',
    hex: '#744719',
    secondaryHex: '#c78f35',
    meaning: 'Focus, Golden Fortune & Vital Grounding',
    filipinoMeaning: 'Matalas na pansin, diskarte sa buhay, at pananalapi',
    description: 'A chatoyant quartz loaded with golden-brown bands. It supports confidence under pressure, sharpens focus, balances male/female energies, and grounds active intent.',
    properties: { protection: 75, abundance: 70, vitality: 80 },
    mineralGroup: 'Macrocrystalline Quartz',
    mohsHardness: 7.0
  },
  'Citrine': {
    name: 'Citrine',
    hex: '#c08d20',
    secondaryHex: '#f0c662',
    meaning: 'Merchant\'s Stone, Manifestation & Wealth',
    filipinoMeaning: 'Akit-yaman, tagumpay sa negosyo, at ligaya',
    description: 'The premier stone of financial abundance and manifestation. It carries solar power, warm optimism, and never absorbs or holds negative energy, needing no clearing.',
    properties: { abundance: 98, vitality: 75, calm: 40 },
    mineralGroup: 'Macrocrystalline Quartz',
    mohsHardness: 7.0
  },
  'Pearl': {
    name: 'Pearl',
    hex: '#ebe5da',
    secondaryHex: '#fffaf0',
    meaning: 'Luminous Purity, Grace & Emotional Flow',
    filipinoMeaning: 'Kalinisan ng kalooban, biyaya, at kalmado sa emosyon',
    description: 'Formed slowly in the depths of water, pearl represents wisdom gained through life experiences. It grounds and centers emotional fluctuations with water grace.',
    properties: { calm: 85, love: 65, clarity: 50 },
    mineralGroup: 'Organic Carbonate (Nacre)',
    mohsHardness: 3.5
  }
};

const SIZE_TIER_COST: Record<number, number> = {
  2: 2.50,
  3: 3.00,
  5: 4.00,
  6: 5.50,
  7: 6.50,
  8: 8.00,
  10: 12.00,
  12: 18.00
};

export const SIZES = [2, 3, 5, 6, 7, 8, 10, 12];
export const RARE_SIZES = [2, 3];

export function generateDefaultCatalog(): CatalogItem[] {
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
        id: `stone-${name.toLowerCase().replace(/\s+/g, '-')}-${size}`,
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
    type: 'spacer',
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
}

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    name: 'Coral Jade Fossil',
    sub: 'Kasiglahan & Katatagan (Sample)',
    size: 8,
    pattern: ['Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade', 'Coral Jade']
  },
  {
    name: 'The Guardian',
    sub: 'Panangga & Proteksyon',
    size: 8,
    pattern: ['Onyx', 'Onyx', 'Onyx', 'Lapis Lazuli', 'Onyx', 'Onyx', 'Onyx', 'Tiger Eye']
  },
  {
    name: 'Aura of Serenity',
    sub: 'Kahinahunan & Kapayapaan',
    size: 8,
    pattern: ['Amethyst', 'Rose Quartz', 'Pearl', 'Rose Quartz']
  },
  {
    name: 'Golden Abundance',
    sub: 'Akit-Yaman & Kasaganaan',
    size: 8,
    pattern: ['Citrine', 'Jade', 'Tiger Eye', 'Citrine', 'Jade', 'Tiger Eye']
  },
  {
    name: 'Sovereign Vitality',
    sub: 'Tapang & Lakas ng Loob',
    size: 8,
    pattern: ['Carnelian', 'Tiger Eye', 'Onyx', 'Carnelian', 'Tiger Eye', 'Onyx']
  }
];

export const ADDON_OPTIONS: AddonOption[] = [
  {
    id: 'gift-box',
    name: 'Luxury Velvet Display Box',
    price: 60,
    description: 'A deep emerald velvet jewelry box with hot-stamped gold foil logo, ideal for gift-giving.'
  },
  {
    id: 'linen-pouch',
    name: 'Fine Linen Threaded Pouch',
    price: 30,
    description: 'An organic linen drawstring pouch with silk cord, soft on gemstone polishes.'
  },
  {
    id: 'sage-cleansing',
    name: 'Californian White Sage Cleansing',
    price: 25,
    description: 'Our studio cleanses your design with white sage smoke and sound bath before shipping.'
  }
];

export const REGIONS: Record<string, number> = {
  'Metro Manila': 75,
  'Luzon (Provincial)': 110,
  'Visayas (Provincial)': 135,
  'Mindanao (Provincial)': 155
};

export const DEFAULT_VOUCHERS: Voucher[] = [
  { code: 'ARTISAN10', type: 'percent', value: 10, minSpend: 800 },
  { code: 'GOLDENHOUR', type: 'amount', value: 150, minSpend: 1500 },
  { code: 'WELCOMESUG', type: 'percent', value: 5 }
];
