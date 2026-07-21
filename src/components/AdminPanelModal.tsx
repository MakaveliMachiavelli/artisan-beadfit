import React, { useState } from 'react';
import { Lock, Settings2 } from 'lucide-react';
import { CatalogItem } from '../types';
import { REGIONS } from '../data';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  markup: number;
  setMarkup: (val: number) => void;
  laborCost: number;
  setLaborCost: (val: number) => void;
  packingCost: number;
  setPackingCost: (val: number) => void;
  catalog: CatalogItem[];
  showToast: (msg: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  markup,
  setMarkup,
  laborCost,
  setLaborCost,
  packingCost,
  setPackingCost,
  catalog,
  showToast,
}) => {
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(false);
  const [adminPass, setAdminPass] = useState<string>('');
  const [adminTab, setAdminTab] = useState<'Catalog' | 'Pricing' | 'Shipping'>('Catalog');

  if (!isOpen) return null;

  const handleAdminUnlock = () => {
    if (adminPass === 'beadfit') {
      setAdminUnlocked(true);
      setAdminPass('');
      showToast('Admin studio unlocked.');
    } else {
      showToast('Incorrect studio passcode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-obsidian-950/40 backdrop-blur-sm">
      <div className="bg-[#FAF9F6] w-full max-w-2xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-obsidian-200/50">
        {/* Admin Header */}
        <div className="flex justify-between items-center p-6 border-b hairline border-obsidian-200/50 glass-panel/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--theme-primary)] flex items-center justify-center shadow-sm">
              <Settings2 className="w-5 h-5 text-gold-100" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-obsidian-950">System Configuration</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:glass-panel flex items-center justify-center text-obsidian-500"
          >
            ✕
          </button>
        </div>

        {/* Admin Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!adminUnlocked ? (
            <div className="space-y-4 max-w-sm mx-auto text-center py-8">
              <div className="w-12 h-12 glass-panel rounded-full flex items-center justify-center mx-auto text-gold-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-xl font-bold">Authentication Required</h4>
                <p className="text-xs text-obsidian-500 mt-1">Enter the studio passcode to configure pricing markups, labor metrics, and global shipping lists.</p>
              </div>
              <input 
                type="password" 
                placeholder="Studio Passcode (hint: beadfit)"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminUnlock()}
                className="w-full glass-panel/30 border hairline border-obsidian-200/50 px-3.5 py-2.5 rounded-sm text-center text-sm focus:outline-none focus:border-gold-500"
              />
              <button
                onClick={handleAdminUnlock}
                className="w-full bg-[var(--theme-primary)] hover:brightness-110 text-gold-100 text-xs font-semibold py-3 rounded-sm transition-colors"
              >
                Unlock Studio Settings
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Admin Tabs */}
              <div className="flex border-b hairline border-obsidian-200/50">
                {(['Catalog', 'Pricing', 'Shipping'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAdminTab(tab)}
                    className={`flex-1 pb-2.5 text-xs font-mono font-bold tracking-[0.18em] uppercase transition-all ${
                      adminTab === tab 
                        ? 'border-b hairline border-gold-500 text-gold-600' 
                        : 'text-obsidian-400 hover:text-obsidian-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Pricing Admin Module */}
              {adminTab === 'Pricing' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400">Retail Price Markup (Multiplier of Cost)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={markup}
                      onChange={(e) => setMarkup(parseFloat(e.target.value) || 1.0)}
                      className="w-full glass-panel/30 border hairline border-obsidian-200/50 px-3 py-2 rounded-sm text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400">Fixed Crafting Labor Cost (₱)</label>
                    <input 
                      type="number" 
                      value={laborCost}
                      onChange={(e) => setLaborCost(parseInt(e.target.value) || 0)}
                      className="w-full glass-panel/30 border hairline border-obsidian-200/50 px-3 py-2 rounded-sm text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400">Luxury Velvet Box Packing Cost (₱)</label>
                    <input 
                      type="number" 
                      value={packingCost}
                      onChange={(e) => setPackingCost(parseInt(e.target.value) || 0)}
                      className="w-full glass-panel/30 border hairline border-obsidian-200/50 px-3 py-2 rounded-sm text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Shipping Admin Module */}
              {adminTab === 'Shipping' && (
                <div className="space-y-4">
                  <h4 className="font-serif text-sm font-semibold">Courier Shipping Cost by destination (₱):</h4>
                  <div className="space-y-2">
                    {Object.entries(REGIONS).map(([region, price]) => (
                      <div key={region} className="flex justify-between items-center glass-panel/30 border hairline border-obsidian-200/50 p-2.5 rounded-sm">
                        <span className="text-xs font-semibold text-obsidian-800">{region}</span>
                        <span className="text-xs font-mono font-bold">₱{price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Catalog Component List */}
              {adminTab === 'Catalog' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400">All registered jewelry materials</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-600 glass-panel px-2 py-0.5 rounded-md">{catalog.length} Items</span>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto border hairline border-obsidian-200/50 rounded-sm p-2 glass-panel/30">
                    {catalog.map((item) => (
                      <div key={item.id} className="flex justify-between items-center glass-panel p-2.5 rounded-sm border hairline border-obsidian-200/50 shadow-sm text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: item.hex }} />
                          <div>
                            <span className="font-semibold text-obsidian-950 block">{item.name}</span>
                            <span className="text-[10px] text-obsidian-400 font-mono">{item.size}mm · {item.type} · {item.quality || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold block">₱{Math.round(item.cost * markup)}</span>
                          <span className="text-[10px] text-obsidian-400 font-mono">Cost: ₱{item.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Footer */}
        <div className="p-6 border-t hairline border-obsidian-200/50 glass-panel/30 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-[var(--theme-primary)] hover:brightness-110 text-gold-100 text-xs font-semibold py-2.5 px-6 rounded-sm transition-colors"
          >
            Close System Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
