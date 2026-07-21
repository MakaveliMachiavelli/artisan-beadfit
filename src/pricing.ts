import { BeadInstance, CatalogItem, Voucher, AddonOption } from './types';

export interface BasePriceStats {
  totalMaterialCost: number;
  laborCost: number;
  markup: number;
  basePrice: number;
}

export function calculateBasePrice(
  beads: BeadInstance[],
  activeCharm: CatalogItem | null,
  laborCost: number,
  markup: number
): BasePriceStats {
  let totalMaterialCost = beads.reduce((sum, b) => sum + b.cost, 0);
  if (activeCharm) {
    totalMaterialCost += activeCharm.cost;
  }
  const basePrice = Math.round((totalMaterialCost + laborCost) * markup);

  return {
    totalMaterialCost,
    laborCost,
    markup,
    basePrice
  };
}

export interface OrderPriceStats {
  subtotal: number;
  addonsPrice: number;
  discount: number;
  shipping: number;
  packingCost: number;
  finalTotal: number;
}

export function calculateOrderTotal(
  basePrice: number,
  orderQty: number,
  selectedAddons: string[],
  appliedVoucher: Voucher | null,
  orderRegion: string,
  packingCost: number,
  addonOptions: AddonOption[],
  regionsMap: Record<string, number>
): OrderPriceStats {
  const addonsPrice = selectedAddons.reduce((sum, id) => {
    const addon = addonOptions.find(a => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const subtotal = basePrice * orderQty;
  const withAddons = subtotal + addonsPrice;

  let discount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'percent') {
      discount = Math.round((subtotal * appliedVoucher.value) / 100);
    } else {
      discount = appliedVoucher.value;
    }
  }

  const shipping = regionsMap[orderRegion] || 0;
  const finalTotal = withAddons - discount + shipping + packingCost;

  return {
    subtotal,
    addonsPrice,
    discount,
    shipping,
    packingCost,
    finalTotal
  };
}
