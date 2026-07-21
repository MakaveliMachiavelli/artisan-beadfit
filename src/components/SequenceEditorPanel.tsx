import React from 'react';
import { Layers, Gem, Wand2, Minus, Plus } from 'lucide-react';
import { CatalogItem } from '../types';
import { Panel, SectionHeading, OptionCard, Button, IconButton } from './ui';

interface SequenceEditorPanelProps {
  availableSpacers: CatalogItem[];
  activeSpacerId: string;
  setActiveSpacerId: (id: string) => void;
  availableCharms: CatalogItem[];
  selectedCharmId: string;
  setSelectedCharmId: (id: string) => void;
  markup: number;
  applyGoldenRatioAutoStyle: () => void;
  autoFitBracelet: () => void;
  beadsCount: number;
  designLength: number;
  handleAddBead: () => void;
  handleRemoveBead: () => void;
}

const MIN_BEADS = 6;

export const SequenceEditorPanel: React.FC<SequenceEditorPanelProps> = ({
  availableSpacers,
  activeSpacerId,
  setActiveSpacerId,
  availableCharms,
  selectedCharmId,
  setSelectedCharmId,
  markup,
  applyGoldenRatioAutoStyle,
  autoFitBracelet,
  beadsCount,
  designLength,
  handleAddBead,
  handleRemoveBead,
}) => {
  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Spacers                                                          */}
      {/* ---------------------------------------------------------------- */}
      <Panel>
        <div className="space-y-4">
          <SectionHeading
            step={4}
            icon={<Layers className="h-4 w-4" />}
            title="Accent spacers"
            hint="Metal dividers that set the rhythm between stones."
          />
          <fieldset>
            <legend className="sr-only-x">Accent spacer</legend>
            {/* The seeded catalog currently carries a single spacer. A fixed
                two-column grid left it as an orphan tile beside a gap, which
                read as a failed render rather than a short list. */}
            <div
              className={`grid gap-1.5 ${
                availableSpacers.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {availableSpacers.slice(0, 6).map((sp) => (
                <label
                  key={sp.id}
                  className={`u-interactive u-press flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] border px-3 py-2.5 ${
                    activeSpacerId === sp.id
                      ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--color-text-onDark)] shadow-[var(--shadow-e2)]'
                      : 'border-[var(--color-line)] bg-white/60 text-[var(--color-text-secondary)] hover:border-[var(--color-gold-400)] hover:bg-white hover:shadow-[var(--shadow-e2)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="spacer"
                    checked={activeSpacerId === sp.id}
                    onChange={() => setActiveSpacerId(sp.id)}
                    className="sr-only-x"
                  />
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 rounded-full shadow-inner ring-1 ring-black/10"
                      style={{ backgroundColor: sp.hex }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-semibold leading-tight">
                        {sp.name}
                      </span>
                      <span
                        className={`numeral block text-[11px] leading-tight ${
                          activeSpacerId === sp.id
                            ? 'text-[var(--color-text-onDark)]/70'
                            : 'text-[var(--color-text-muted)]'
                        }`}
                      >
                        {sp.size}mm · {sp.material}
                      </span>
                    </span>
                  </span>
                  <span className="numeral shrink-0 text-[12px] font-semibold">₱{Math.round(sp.cost * markup)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </Panel>

      {/* ---------------------------------------------------------------- */}
      {/* Pendant                                                          */}
      {/* ---------------------------------------------------------------- */}
      <Panel>
        <div className="space-y-4">
          <SectionHeading
            step={5}
            icon={<Gem className="h-4 w-4" />}
            title="Centre pendant"
            hint="Optional focal piece, hand-finished and set at the midpoint."
          />
          {/* With no pendants in the catalog the only tile was "None", which
              presented a choice that wasn't one. State it plainly instead. */}
          {availableCharms.length === 0 ? (
            <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-sunken)]/60 px-4 py-5 text-center text-[12.5px] leading-relaxed text-[var(--color-text-muted)]">
              No pendants are stocked right now.
              <br />
              This strand will be finished without a centre piece.
            </p>
          ) : (
            <fieldset>
              <legend className="sr-only-x">Centre pendant</legend>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                <OptionCard
                  name="charm"
                  align="center"
                  selected={selectedCharmId === 'none'}
                  onSelect={() => setSelectedCharmId('none')}
                  title="None"
                  subtitle="no charm"
                />
                {availableCharms.map((ch) => (
                  <OptionCard
                    key={ch.id}
                    name="charm"
                    align="center"
                    selected={selectedCharmId === ch.id}
                    onSelect={() => setSelectedCharmId(ch.id)}
                    swatch={ch.hex}
                    title={ch.name.replace(' Pendant', '')}
                    subtitle={`₱${Math.round(ch.cost * markup)}`}
                  />
                ))}
              </div>
            </fieldset>
          )}
        </div>
      </Panel>

      {/* ---------------------------------------------------------------- */}
      {/* Strand tuning                                                    */}
      {/* ---------------------------------------------------------------- */}
      <Panel>
        <div className="space-y-4">
          <SectionHeading
            step={6}
            icon={<Wand2 className="h-4 w-4" />}
            title="Strand tuning"
            hint="Let the studio balance the layout, or adjust the bead count by hand."
          />

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <Button variant="primary" onClick={applyGoldenRatioAutoStyle}>
              Golden ratio
            </Button>
            <Button variant="secondary" onClick={autoFitBracelet}>
              Auto-fit
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white/60 px-4 py-3">
            <div className="min-w-0">
              <span className="label-micro block">Strand length</span>
              <span className="numeral text-[18px] font-semibold text-[var(--theme-primary)]">
                {designLength}
                <span className="ml-0.5 text-[12px] font-medium text-[var(--color-text-muted)]">mm</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <IconButton
                label="Remove one bead"
                onClick={handleRemoveBead}
                disabled={beadsCount <= MIN_BEADS}
              >
                <Minus className="h-4 w-4" />
              </IconButton>
              <span
                aria-live="polite"
                className="numeral min-w-[3.25rem] rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-white px-3 py-2 text-center text-[15px] font-semibold text-[var(--color-text-primary)]"
              >
                {beadsCount}
              </span>
              <IconButton label="Add one bead" onClick={handleAddBead}>
                <Plus className="h-4 w-4" />
              </IconButton>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
            Tap any bead in the preview to swap or remove it individually.
            {beadsCount <= MIN_BEADS && ` Minimum ${MIN_BEADS} beads keeps the strand structural.`}
          </p>
        </div>
      </Panel>
    </>
  );
};
