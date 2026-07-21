import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { CatalogItem } from '../types';
import { REGIONS } from '../data';
import { ModalShell, Button, Field, inputClass, Badge } from './ui';

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

const TABS = ['Catalog', 'Pricing', 'Shipping'] as const;
type Tab = (typeof TABS)[number];

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
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminTab, setAdminTab] = useState<Tab>('Catalog');
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminUnlock = () => {
    if (adminPass === 'beadfit') {
      setAdminUnlocked(true);
      setAdminPass('');
      setAuthError(null);
      showToast('Studio settings unlocked');
    } else {
      /* Inline error next to the field. Previously the only feedback was a
         toast at the far bottom of the screen, away from the input. */
      setAuthError('That passcode was not recognised.');
    }
  };

  return (
    <ModalShell
      open={isOpen}
      onClose={onClose}
      title="Studio configuration"
      subtitle="Pricing, materials and delivery"
      size="md"
      footer={
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      {!adminUnlocked ? (
        <div className="mx-auto max-w-sm space-y-4 py-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-sunken)] text-[var(--color-text-accent)]">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-serif text-heading font-semibold text-[var(--color-text-primary)]">
              Authentication required
            </h4>
            <p className="mt-1 text-label leading-relaxed text-[var(--color-text-muted)]">
              Enter the studio passcode to configure markups, labour and shipping.
            </p>
          </div>

          <div className="space-y-1.5 text-left">
            <label htmlFor="admin-pass" className="label-micro block">
              Studio passcode
            </label>
            <input
              id="admin-pass"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={adminPass}
              aria-invalid={!!authError}
              aria-describedby={authError ? 'admin-pass-err' : undefined}
              onChange={(e) => {
                setAdminPass(e.target.value);
                if (authError) setAuthError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminUnlock()}
              className={`${inputClass} text-center`}
            />
            {authError && (
              <p id="admin-pass-err" role="alert" className="text-small font-medium text-[var(--color-danger-fg)]">
                {authError}
              </p>
            )}
          </div>

          <Button variant="primary" block onClick={handleAdminUnlock}>
            Unlock settings
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Tabs with correct tablist semantics — previously plain buttons
              with no role, so nothing announced the selected panel. */}
          <div role="tablist" aria-label="Configuration sections" className="flex gap-1 border-b border-[var(--color-line)]">
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={adminTab === tab}
                onClick={() => setAdminTab(tab)}
                className={`u-interactive -mb-px border-b-2 px-4 py-2.5 text-label font-semibold ${
                  adminTab === tab
                    ? 'border-[var(--color-gold-600)] text-[var(--color-text-primary)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {adminTab === 'Pricing' && (
            <div className="space-y-4">
              <Field label="Retail markup" hint="Multiplier applied to raw material cost.">
                {(id) => (
                  <input
                    id={id}
                    type="number"
                    step="0.1"
                    min="1"
                    value={markup}
                    onChange={(e) => setMarkup(parseFloat(e.target.value) || 1.0)}
                    className={`${inputClass} numeral`}
                  />
                )}
              </Field>
              <Field label="Crafting labour (₱)" hint="Fixed amount added per finished piece.">
                {(id) => (
                  <input
                    id={id}
                    type="number"
                    min="0"
                    value={laborCost}
                    onChange={(e) => setLaborCost(parseInt(e.target.value) || 0)}
                    className={`${inputClass} numeral`}
                  />
                )}
              </Field>
              <Field label="Velvet box packing (₱)" hint="Charged only when gift packaging is selected.">
                {(id) => (
                  <input
                    id={id}
                    type="number"
                    min="0"
                    value={packingCost}
                    onChange={(e) => setPackingCost(parseInt(e.target.value) || 0)}
                    className={`${inputClass} numeral`}
                  />
                )}
              </Field>
            </div>
          )}

          {adminTab === 'Shipping' && (
            <div className="space-y-3">
              <p className="text-label text-[var(--color-text-muted)]">Courier cost by destination.</p>
              <ul className="divide-y divide-[var(--color-line)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white/60">
                {Object.entries(REGIONS).map(([region, price]) => (
                  <li key={region} className="flex items-center justify-between px-3.5 py-2.5">
                    <span className="text-label font-medium text-[var(--color-text-secondary)]">{region}</span>
                    <span className="numeral text-label font-semibold text-[var(--color-text-primary)]">₱{price}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {adminTab === 'Catalog' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-label text-[var(--color-text-muted)]">Registered materials</span>
                <Badge tone="accent">{catalog.length} items</Badge>
              </div>
              <ul className="scroll-area max-h-[22rem] divide-y divide-[var(--color-line)] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white/60">
                {catalog.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: item.hex }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-label font-semibold text-[var(--color-text-primary)]">
                          {item.name}
                        </span>
                        <span className="numeral block text-micro text-[var(--color-text-muted)]">
                          {item.size}mm · {item.type}
                          {item.quality ? ` · ${item.quality}` : ''}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="numeral block text-label font-semibold text-[var(--color-text-primary)]">
                        ₱{Math.round(item.cost * markup)}
                      </span>
                      <span className="numeral block text-micro text-[var(--color-text-muted)]">
                        cost ₱{item.cost}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </ModalShell>
  );
};
