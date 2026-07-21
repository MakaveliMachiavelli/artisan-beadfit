import React from 'react';
import { Gem } from 'lucide-react';
import { CatalogItem } from '../types';
import { GEMSTONE_DB } from '../data';
import { Panel, SectionHeading, OptionCard } from './ui';

interface GemstoneSelectorPanelProps {
  gemstoneNames: string[];
  mainStone: string;
  setMainStone: (name: string) => void;
  catalog: CatalogItem[];
  mainSize: number;
  setMainSize: (size: number) => void;
  showToast: (msg: string) => void;
  sizesForActiveStone: number[];
  qualitiesForActiveStoneSize: string[];
  mainQuality: string;
  setMainQuality: (quality: string) => void;
  markup: number;
}

export const GemstoneSelectorPanel: React.FC<GemstoneSelectorPanelProps> = ({
  gemstoneNames,
  mainStone,
  setMainStone,
  catalog,
  mainSize,
  setMainSize,
  showToast,
  sizesForActiveStone,
  qualitiesForActiveStoneSize,
  mainQuality,
  setMainQuality,
  markup,
}) => {
  const activeInfo = GEMSTONE_DB[mainStone];

  return (
    <Panel>
      <div className="space-y-5">
        <SectionHeading
          step={1}
          icon={<Gem className="h-4 w-4" />}
          title="Gemstone"
          hint={activeInfo?.meaning ? `${mainStone} — ${activeInfo.meaning}` : 'Choose the primary mineral strand.'}
        />

        {/* Mineral swatches */}
        <fieldset className="min-w-0">
          <legend className="label-micro mb-2.5">Primary mineral strand</legend>
          <div className="flex flex-wrap gap-2">
            {gemstoneNames.map((name) => {
              const dbInfo = GEMSTONE_DB[name];
              const active = mainStone === name;
              return (
                <label
                  key={name}
                  className={`u-interactive u-press flex min-h-[38px] cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 ${
                    active
                      ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--color-text-onDark)] shadow-[var(--shadow-e2)]'
                      : 'border-[var(--color-line)] bg-white/60 text-[var(--color-text-secondary)] hover:border-[var(--color-gold-400)] hover:bg-white hover:shadow-[var(--shadow-e2)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="main-stone"
                    checked={active}
                    onChange={() => {
                      setMainStone(name);
                      const sizes = [
                        ...new Set(
                          catalog.filter((i) => i.type === 'stone' && i.name === name).map((i) => i.size)
                        ),
                      ];
                      if (!sizes.includes(mainSize)) setMainSize(sizes[0] || 8);
                      showToast(`${name} selected`);
                    }}
                    className="sr-only-x"
                  />
                  <span
                    aria-hidden="true"
                    className="relative h-3.5 w-3.5 shrink-0 rounded-full shadow-inner ring-1 ring-black/10"
                    style={{ backgroundColor: dbInfo?.hex }}
                  >
                    <span className="absolute left-[3px] top-[2px] h-1 w-1 rounded-full bg-white/70" />
                  </span>
                  <span className="text-label font-medium leading-none">{name}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Caliber */}
          <fieldset className="min-w-0">
            <legend className="label-micro mb-2">Bead caliber</legend>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-3">
              {sizesForActiveStone.map((sz) => {
                const isRare = sz <= 3;
                return (
                  <OptionCard
                    key={sz}
                    name="bead-size"
                    align="center"
                    selected={mainSize === sz}
                    onSelect={() => setMainSize(sz)}
                    title={<span className="numeral">{sz}</span>}
                    subtitle={isRare ? 'rare' : 'mm'}
                    className={
                      isRare && mainSize !== sz
                        ? '!border-[var(--color-gold-400)] !bg-[var(--color-gold-50)]'
                        : ''
                    }
                  />
                );
              })}
            </div>
          </fieldset>

          {/* Lustre */}
          <fieldset className="min-w-0">
            <legend className="label-micro mb-2">Lustre quality</legend>
            <div className="grid grid-cols-2 gap-1.5">
              {qualitiesForActiveStoneSize.map((q) => {
                const it = catalog.find(
                  (i) =>
                    i.type === 'stone' &&
                    i.name === mainStone &&
                    i.size === mainSize &&
                    i.quality === q
                );
                const basePrice = it ? Math.round(it.cost * markup) : 0;
                return (
                  <OptionCard
                    key={q}
                    name="bead-quality"
                    selected={mainQuality === q}
                    onSelect={() => setMainQuality(q)}
                    title={q.replace(' Grade', '')}
                    subtitle={`₱${basePrice}/bead`}
                  />
                );
              })}
            </div>
          </fieldset>
        </div>
      </div>
    </Panel>
  );
};
