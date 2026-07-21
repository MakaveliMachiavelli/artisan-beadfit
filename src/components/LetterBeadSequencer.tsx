import React from 'react';
import { Type } from 'lucide-react';
import { Panel, SectionHeading, OptionCard } from './ui';

interface LetterBeadSequencerProps {
  customWord: string;
  setCustomWord: (word: string) => void;
  letterStyle: 'white-gold' | 'black-white' | 'gold-metal';
  setLetterStyle: (style: 'white-gold' | 'black-white' | 'gold-metal') => void;
}

const MAX_LETTERS = 10;

const FINISHES = [
  { id: 'white-gold', label: 'White / Gold', sub: 'acrylic' },
  { id: 'black-white', label: 'Black / White', sub: 'acrylic' },
  { id: 'gold-metal', label: 'Gold', sub: 'solid metal' },
] as const;

export const LetterBeadSequencer: React.FC<LetterBeadSequencerProps> = ({
  customWord,
  setCustomWord,
  letterStyle,
  setLetterStyle,
}) => {
  const remaining = MAX_LETTERS - customWord.length;

  return (
    <Panel>
      <div className="space-y-5">
        <SectionHeading
          step={3}
          icon={<Type className="h-4 w-4" />}
          title="Custom lettering"
          hint="Optional. Letters are set at the focal point and balanced automatically."
        />

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="engrave-word" className="label-micro">
              Engrave a word
            </label>
            {/* Live counter — previously the 10-char cap silently swallowed
                keystrokes with no indication of why. */}
            <span
              className={`numeral text-[11px] ${
                remaining === 0 ? 'text-[var(--color-text-accent)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {remaining} left
            </span>
          </div>

          <input
            id="engrave-word"
            type="text"
            maxLength={MAX_LETTERS}
            placeholder="NANAY"
            value={customWord}
            onChange={(e) => setCustomWord(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
            aria-describedby="engrave-hint"
            className="u-interactive mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-white/80 px-4 py-3 text-center font-mono text-[20px] font-semibold uppercase tracking-[0.35em] text-[var(--color-text-primary)] placeholder:tracking-[0.25em] placeholder:text-[var(--color-obsidian-300)] hover:border-[var(--color-gold-400)] focus:border-[var(--color-gold-600)] focus:bg-white"
          />
          <p id="engrave-hint" className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
            Letters A–Z only, up to {MAX_LETTERS}.
          </p>
        </div>

        <fieldset>
          <legend className="label-micro mb-2">Material finish</legend>
          <div className="grid grid-cols-3 gap-1.5">
            {FINISHES.map((f) => (
              <OptionCard
                key={f.id}
                name="letter-finish"
                selected={letterStyle === f.id}
                onSelect={() => setLetterStyle(f.id)}
                title={f.label}
                subtitle={f.sub}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </Panel>
  );
};
