import re

with open('checkout_logic.ts', 'r') as f:
    checkout_logic = f.read()

with open('checkout_raw.tsx', 'r') as f:
    checkout_ui = f.read()

component_str = f"""import React, {{ useState, useMemo }} from 'react';
import {{ BeadInstance, CatalogItem, Voucher }} from '../types';
import {{ ADDON_OPTIONS, REGIONS, DEFAULT_VOUCHERS, GEMSTONE_DB }} from '../data';
import {{ Copy, Share2, Check, Package }} from 'lucide-react';

interface CheckoutModalProps {{
  isOpen: boolean;
  onClose: () => void;
  beads: BeadInstance[];
  activeCharm: CatalogItem | null;
  designStats: {{
    price: number;
    target: number;
    innerFit: number;
    discrepancy: number;
    status: 'perfect' | 'loose' | 'tight';
    length: number;
  }};
  mainStone: string;
  mainSize: number;
  mainQuality: string;
  wristMm: number;
  ease: number;
  packaging: 'none' | 'velvet-box' | 'linen-pouch';
  packingCost: number;
  showToast: (message: string, type?: 'info' | 'success') => void;
}}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({{
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
}}) => {{
  const [orderName, setOrderName] = useState<string>('');
  const [orderContact, setOrderContact] = useState<string>('');
  const [orderAddress, setOrderAddress] = useState<string>('');
  const [orderRegion, setOrderRegion] = useState<string>('Metro Manila');
  const [orderQty, setOrderQty] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [orderView, setOrderView] = useState<'customer' | 'bench'>('customer');

  if (!isOpen) return null;

{checkout_logic}

  return (
{checkout_ui}
  );
}};
"""

# Replace setIsOrderOpen(false) with onClose()
component_str = component_str.replace("setIsOrderOpen(false)", "onClose()")
# remove the outer {isOrderOpen && (  and its closing )
# wait, the checkout_ui currently has {isOrderOpen && (
# let's just do a regex
component_str = re.sub(r'\{isOrderOpen && \(\n\s*<div', '<div', component_str)
component_str = re.sub(r'\s*\)\}\n\s*\Z', '\n', component_str)

with open('src/components/CheckoutModal.tsx', 'w') as f:
    f.write(component_str)

