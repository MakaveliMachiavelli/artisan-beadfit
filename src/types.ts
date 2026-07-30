export type BeadType = 'stone' | 'spacer' | 'charm' | 'letter';

export interface GemstoneInfo {
  name: string;
  hex: string;
  secondaryHex?: string; // For realistic 3D gemstone gradient representation
  meaning: string;
  filipinoMeaning: string;
  description: string;
  properties: {
    protection?: number; // percentage
    clarity?: number;
    abundance?: number;
    calm?: number;
    love?: number;
    vitality?: number;
  };
  mineralGroup: string;
  mohsHardness: number;
}

export interface CatalogItem {
  id: string;
  type: BeadType;
  name: string;
  material: string;
  quality?: string; // Standard, Premium, Collector
  size: number; // in mm
  lengthMm: number; // effective length in bracelet calculation
  hex: string;
  secondaryHex?: string;
  meaning: string;
  cost: number;
  rare: boolean;
  stock: number;
}

export interface BeadInstance {
  id: string; // unique instance id for list rendering keys
  itemId: string; // reference to CatalogItem
  type: BeadType;
  name: string;
  quality?: string;
  size: number;
  lengthMm: number;
  hex: string;
  secondaryHex?: string;
  photoUrl?: string; // custom uploaded photo texture
  cost: number;
  letter?: string;
  letterStyle?: string;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Voucher {
  code: string;
  type: 'percent' | 'amount';
  value: number;
  minSpend?: number;
}

export interface DesignPreset {
  name: string;
  sub: string;
  size: number;
  pattern: string[];
}
