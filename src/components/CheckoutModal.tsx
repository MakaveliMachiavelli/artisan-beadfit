import React, { useState, useMemo } from 'react';
import { BeadInstance, CatalogItem, Voucher } from '../types';
import { ADDON_OPTIONS, REGIONS, DEFAULT_VOUCHERS, GEMSTONE_DB } from '../data';
import { calculateOrderTotal } from '../pricing';
import { Copy, Share2, Check, Package, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  beads: BeadInstance[];
  activeCharm: CatalogItem | null;
  designStats: {
    price: number;
    target: number;
    innerFit: number;
    discrepancy: number;
    status: 'perfect' | 'loose' | 'tight';
    length: number;
  };
  mainStone: string;
  mainSize: number;
  mainQuality: string;
  wristMm: number;
  ease: number;
  packaging: 'none' | 'velvet-box' | 'linen-pouch';
  packingCost: number;
  showToast: (message: string, type?: 'info' | 'success') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  beads,
  activeCharm,
  designStats,
  mainStone,
  mainSize,
  mainQuality,
  wristMm,
  ease,
  packaging,
  packingCost,
  showToast,
}) => {
  const [orderName, setOrderName] = useState<string>('');
  const [orderContact, setOrderContact] = useState<string>('');
  const [orderAddress, setOrderAddress] = useState<string>('');
  const [orderRegion, setOrderRegion] = useState<string>('Metro Manila');
  const [orderQty, setOrderQty] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const { addItem, checkout, isLoading: isCartLoading } = useCartStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [orderView, setOrderView] = useState<'customer' | 'bench'>('customer');

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Order details copied to clipboard.');
  };

  // --- VOUCHER ---
  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      setAppliedVoucher(null);
      setVoucherError('');
      return;
    }
    const match = DEFAULT_VOUCHERS.find(v => v.code.toUpperCase() === voucherCode.trim().toUpperCase());
    if (match) {
      if (match.minSpend && designStats.price * orderQty < match.minSpend) {
        setVoucherError(`Minimum spend of ₱${match.minSpend} required.`);
        setAppliedVoucher(null);
      } else {
        setAppliedVoucher(match);
        setVoucherError('');
        showToast(`Promo "${match.code}" applied!`);
      }
    } else {
      setVoucherError('Invalid voucher code.');
      setAppliedVoucher(null);
    }
  };

  // --- ORDER DISPATCH WRITER ---
  const orderCalculations = useMemo(() => {
    return calculateOrderTotal(
      designStats.price,
      orderQty,
      selectedAddons,
      appliedVoucher,
      orderRegion,
      packingCost,
      ADDON_OPTIONS,
      REGIONS
    );
  }, [designStats.price, orderQty, selectedAddons, appliedVoucher, orderRegion, packingCost]);

  const customerOrderSheetText = useMemo(() => {
    const lines = [
      `✨ ARTISAN BEADFIT — Bespoke Jewelry Studio`,
      `Order Sheet / Inward Manifest`,
      `────────────────────────────────────────`,
      `Bracelet Specs:`,
      `• Gemstone: ${mainStone} (${mainSize}mm - ${mainQuality})`,
      `• Sizing: ${beads.length} Beads, Outer path: ${designStats.length}mm`,
      `• Wrist Perimeter: ${(wristMm / 10).toFixed(1)}cm (${wristMm}mm)`,
      `• Comfort Allowance: +${ease}mm (${ease === 3 ? 'Snug' : ease === 12 ? 'Relaxed' : 'Standard'})`,
      `• Actual Sizing Match: ${designStats.status.toUpperCase()} (${(designStats.discrepancy >= 0 ? '+' : '')}${designStats.discrepancy.toFixed(1)}mm)`,
      `• Unique Design Code: ABF-${beads.length}${mainSize}-${wristMm}`,
      ``,
      `Composition Breakdown:`,
      ...beads.map((b, i) => `  [${(i+1).toString().padStart(2, '0')}] ${b.size}mm ${b.name} (${b.quality || 'Spacer/Accent'})`),
      activeCharm ? `  [Charm] ${activeCharm.name} (${activeCharm.material})` : '',
      ``,
      `Client Details:`,
      `• Name: ${orderName || '(Pending)'}`,
      `• Contact: ${orderContact || '(Pending)'}`,
      `• Shipping Destination: ${orderAddress || '(Pending)'} (${orderRegion})`,
      orderNotes ? `• Notes/Customization: ${orderNotes}` : '',
      `────────────────────────────────────────`,
      `Billing Breakdown:`,
      `  Bracelet base price: ₱${designStats.price} x ${orderQty} qty = ₱${orderCalculations.subtotal}`,
      selectedAddons.length > 0 ? `  Add-ons selected: ₱${orderCalculations.addonsPrice} (${selectedAddons.map(id => ADDON_OPTIONS.find(a => a.id === id)?.name).join(', ')})` : '',
      orderCalculations.discount > 0 ? `  Promo code discount: -₱${orderCalculations.discount} (${appliedVoucher?.code})` : '',
      `  Luxury packing fee: ₱${packingCost}`,
      `  Courier shipping fee: ₱${orderCalculations.shipping} (${orderRegion})`,
      `  ──────────────────────────────────`,
      `  TOTAL ORDER VALUE: ₱${orderCalculations.finalTotal}`,
      `────────────────────────────────────────`,
      `📌 Direct Pay GCash: 0917-123-4567 (Artisan Jewelry Studio)`,
      `Lead Time: 3-5 Working Days. Send transaction receipt via Viber/FB Messenger to commence stringing.`
    ];
    return lines.filter(l => l !== null && l !== undefined).join('\n');
  }, [
    mainStone, mainSize, mainQuality, beads, wristMm, ease, designStats, activeCharm, 
    orderName, orderContact, orderAddress, orderRegion, orderNotes, orderQty, 
    selectedAddons, orderCalculations, appliedVoucher, packingCost
  ]);

  const benchSheetText = useMemo(() => {
    const lines = [
      `🛠 BENCH SHEET — STRINGING SPECIFICATION`,
      `Artisan Beadfit Assembly Guide`,
      `────────────────────────────────────────`,
      `TARGET PERIMETER: ${designStats.target.toFixed(1)}mm | MEASURED FIT: ${designStats.innerFit.toFixed(1)}mm`,
      `MOHS HARDNESS PROFILE:`,
      ...([...new Set(beads.map(b => b.name))] as string[]).map(name => {
        const info = GEMSTONE_DB[name];
        return info ? `  • ${name}: Hardness ${info.mohsHardness} (${info.mineralGroup})` : '';
      }),
      ``,
      `ASSEMBLY BEAD SEQUENCE (Total ${beads.length} beads):`,
      `[STRING DIRECTION: LEFT TO RIGHT]`,
      `  Clasp/Knot Anchor Point`,
      ...beads.map((b, i) => `  → Bead #${(i+1).toString().padStart(2, '0')}: ${b.size}mm ${b.name} (${b.quality || 'Spacer'}) [Hex: ${b.hex}]`),
      activeCharm ? `  ★ HANGING CHARM: ${activeCharm.name} (${activeCharm.material}) - Center Anchor` : '',
      `  Secure Triple-Knot + Resin Seal`,
      ``,
      `PHYSICAL DIAGNOSTICS:`,
      `• Weight estimate: ${Math.round(beads.reduce((sum, b) => sum + b.size * 1.2, 0))}g`,
      `• Fit Tolerance: ${designStats.discrepancy.toFixed(1)}mm deviation.`,
      `• Sizing Rating: ${designStats.status.toUpperCase()}`,
      `────────────────────────────────────────`,
      `Recipient: ${orderName || 'Guest'} (${orderRegion})`,
      `Package Selection: ${packaging === 'velvet-box' ? 'Emerald Velvet Tray Box' : packaging === 'linen-pouch' ? 'Oatmeal Linen Pouch' : 'Standard Kraft Sleeve'}`
    ];
    return lines.filter(Boolean).join('\n');
  }, [beads, activeCharm, designStats, orderName, orderRegion, packaging]);

  const toggleAddon = (id: string) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter(a => a !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };


  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-obsidian-950/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="glass-panel w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */} 
            <div className="p-6 border-b hairline border-obsidian-200/50 flex justify-between items-center glass-panel">
              <div>
                <span className="font-mono text-[10px] tracking-[0.18em] text-gold-600 uppercase font-bold">Checkout Dispatch</span>
                <h3 className="font-serif text-2xl font-bold text-obsidian-950">Direct Studio Order</h3>
              </div>
              <button onClick={() => onClose()} className="w-10 h-10 rounded-full hover:glass-panel flex items-center justify-center text-obsidian-500 transition-colors">
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Customer Contact Fields */}
              <div className="space-y-4">
                <h4 className="font-serif text-base font-bold text-obsidian-950 border-b hairline border-obsidian-200/50 pb-2">
                  1. Client Logistics
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400">Recipient Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Maria Santos"
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      className="w-full glass-panel/30 border hairline border-obsidian-200/50 px-3 py-2.5 rounded-sm text-sm text-obsidian-950 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400">Viber / FB Messenger / Contact</label>
                    <input 
                      type="text" 
                      placeholder="e.g., 0917-XXX-XXXX or @maria"
                      value={orderContact}
                      onChange={(e) => setOrderContact(e.target.value)}
                      className="w-full glass-panel/30 border hairline border-obsidian-200/50 px-3 py-2.5 rounded-sm text-sm text-obsidian-950 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400">Delivery Address</label>
                  <textarea 
                    rows={2}
                    placeholder="Unit/House No., Street name, Barangay, City, Province, ZIP Code"
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    className="w-full glass-panel/30 border hairline border-obsidian-200/50 px-3 py-2.5 rounded-sm text-sm text-obsidian-950 focus:outline-none focus:border-gold-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400">Shipping Region</label>
                    <select
                      value={orderRegion}
                      onChange={(e) => setOrderRegion(e.target.value)}
                      className="w-full glass-panel/30 border hairline border-obsidian-200/50 px-3 py-2.5 rounded-sm text-sm text-obsidian-950 focus:outline-none focus:border-gold-500"
                    >
                      {Object.keys(REGIONS).map(r => (
                        <option key={r} value={r}>{r} (+₱{REGIONS[r]})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400">Quantity</label>
                    <div className="flex items-center border hairline border-obsidian-200/50 rounded-sm overflow-hidden glass-panel/30">
                      <button 
                        onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                        className="px-3 py-2.5 hover:glass-panel text-obsidian-600 font-bold"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={orderQty}
                        onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-center bg-transparent text-sm font-bold focus:outline-none"
                      />
                      <button 
                        onClick={() => setOrderQty(orderQty + 1)}
                        className="px-3 py-2.5 hover:glass-panel text-obsidian-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addons Selection Checklist */}
              <div className="space-y-4">
                <h4 className="font-serif text-base font-bold text-obsidian-950 border-b hairline border-obsidian-200/50 pb-2">
                  2. Luxury Finishing & Packing Options
                </h4>

                <div className="space-y-2.5">
                  {ADDON_OPTIONS.map((addon) => {
                    const checked = selectedAddons.includes(addon.id);
                    return (
                      <label 
                        key={addon.id}
                        className={`flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-all ${
                          checked 
                            ? 'border-gold-500 glass-panel/30' 
                            : 'hairline border-obsidian-200/50 hover:border-gold-400'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddon(addon.id)}
                          className="mt-1 accent-gold-500"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-semibold text-obsidian-950">{addon.name}</span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-600 font-bold">+₱{addon.price}</span>
                          </div>
                          <span className="block text-[10px] text-obsidian-400 mt-0.5 leading-relaxed">{addon.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Coupon / Voucher Codes */}
              <div className="space-y-4">
                <h4 className="font-serif text-base font-bold text-obsidian-950 border-b hairline border-obsidian-200/50 pb-2">
                  3. Promotional Studio Voucher
                </h4>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Enter Voucher (e.g., ARTISAN10)"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1 glass-panel/30 border hairline border-obsidian-200/50 px-3 py-2 rounded-sm text-sm focus:outline-none"
                  />
                  <button 
                    onClick={handleApplyVoucher}
                    className="bg-[var(--theme-primary)] hover:brightness-110 text-gold-100 text-xs font-semibold px-4 py-2 rounded-sm"
                  >
                    Apply
                  </button>
                </div>
                {voucherError && (
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-rose-500">{voucherError}</p>
                )}
                {appliedVoucher && (
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-emerald-600">
                    Active Promotion: {appliedVoucher.code} ({appliedVoucher.type === 'percent' ? `${appliedVoucher.value}% Off` : `₱${appliedVoucher.value} Off`})
                  </p>
                )}
              </div>

              {/* Order Notes */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400">Additional Sizing or Structural Instructions</label>
                <textarea 
                  rows={2}
                  placeholder="e.g., Place the Jade Pendant exactly at the opposite end of the clasp."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full glass-panel/30 border hairline border-obsidian-200/50 px-3 py-2.5 rounded-sm text-sm focus:outline-none resize-none"
                />
              </div>

              {/* Real-time Order calculations readout */}
              <div className="glass-panel border hairline border-obsidian-200/50 p-5 rounded-sm space-y-3 font-mono text-[10px] uppercase tracking-[0.18em]">
                <div className="flex justify-between">
                  <span>Bespoke Bracelet ({beads.length} Beads) × {orderQty}</span>
                  <span className="font-serif text-lg font-bold text-obsidian-900">₱{orderCalculations.subtotal}</span>
                </div>
                {orderCalculations.addonsPrice > 0 && (
                  <div className="flex justify-between">
                    <span>Add-ons Total</span>
                    <span className="font-serif text-lg font-bold text-obsidian-900">₱{orderCalculations.addonsPrice}</span>
                  </div>
                )}
                {orderCalculations.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Promo Discount ({appliedVoucher?.code})</span>
                    <span className="font-serif text-base font-bold text-obsidian-900">-₱{orderCalculations.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Luxury Packing Tray Sleeve</span>
                  <span className="font-serif text-base font-bold text-obsidian-900">₱{packingCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Courier ({orderRegion})</span>
                  <span className="font-serif text-base font-bold text-obsidian-900">₱{orderCalculations.shipping}</span>
                </div>
                <hr className="hairline border-obsidian-200/50" />
                <div className="flex justify-between text-sm font-serif font-bold text-obsidian-950">
                  <span>Grand Total</span>
                  <span>₱{orderCalculations.finalTotal}</span>
                </div>
              </div>

              {/* Sheet choice toggles */}
              <div className="flex glass-panel p-1 rounded-sm hairline border-obsidian-200/50">
                <button
                  onClick={() => setOrderView('customer')}
                  className={`flex-1 py-1.5 text-xs font-mono rounded-sm transition-all ${
                    orderView === 'customer' ? 'glass-panel text-gold-600 font-semibold shadow-sm' : 'text-obsidian-400'
                  }`}
                >
                  Customer Order Manifest
                </button>
                <button
                  onClick={() => setOrderView('bench')}
                  className={`flex-1 py-1.5 text-xs font-mono rounded-sm transition-all ${
                    orderView === 'bench' ? 'glass-panel text-gold-600 font-semibold shadow-sm' : 'text-obsidian-400'
                  }`}
                >
                  Goldsmith Bench Sheet
                </button>
              </div>

              {/* Output block */}
              <div className="bg-obsidian-950 text-gold-100 p-4 rounded-sm text-xs font-mono whitespace-pre overflow-x-auto max-h-60 shadow-inner">
                {orderView === 'customer' ? customerOrderSheetText : benchSheetText}
              </div>

            </div>

            {/* Modal Footer actions */}
            <div className="p-6 border-t hairline border-obsidian-200/50 flex flex-col gap-3 glass-panel/20">
              {!user && (
                <div className="text-xs text-center text-obsidian-500 font-mono mb-2">
                  Please close this modal and sign in to place your order.
                </div>
              )}
              <div className="flex gap-3">
                <button
                  disabled={!user || isProcessing}
                  onClick={async () => {
                    if (!user) return;
                    setIsProcessing(true);
                    try {
                      // Serialize beads configuration
                      // In a real app we would map this to the exact Variant IDs.
                      // For now, we just pass the raw beads list as configuration.
                      const configString = JSON.stringify(beads);
                      await addItem('CUSTOM_BRACELET', orderQty, configString);
                      showToast('Added to Cart! Processing Checkout...');
                      
                      const order = await checkout();
                      showToast('Checkout Complete! Order ID: ' + order.id, 'success');
                      onClose();
                    } catch (e: any) {
                      showToast(e.message || 'Checkout failed');
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  className="flex-1 bg-[var(--theme-primary)] hover:brightness-110 text-gold-100 text-sm font-semibold py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Add to Cart & Checkout'}
                </button>
                <button
                  onClick={() => handleCopyToClipboard(orderView === 'customer' ? customerOrderSheetText : benchSheetText)}
                  className="glass-panel border border-gold-300 text-gold-800 hover:glass-panel text-sm font-semibold px-4 rounded-sm"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
      </div>
  );
};
