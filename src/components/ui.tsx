/**
 * Shared UI primitives.
 *
 * Before this existed, every panel hand-wrote its own chrome — the same
 * `glass-panel border hairline border-obsidian-200/50 p-6 rounded-sm` chain
 * appeared with small variations in nine files, and the uppercase micro-label
 * was rewritten ~40 times (sometimes with a class duplicated inside a single
 * attribute). Divergence there is what produced the inconsistent spacing,
 * radii and contrast the audit found.
 *
 * These components own the visual contract. Panels should compose them rather
 * than restating raw utility chains.
 */
import React from 'react';

/* -------------------------------------------------------------------------- */
/* Panel                                                                      */
/* -------------------------------------------------------------------------- */

export const Panel: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section';
  padded?: boolean;
}> = ({ children, className = '', as: Tag = 'section', padded = true }) => (
  <Tag className={`panel ${padded ? 'p-5 sm:p-6' : ''} ${className}`}>{children}</Tag>
);

/* -------------------------------------------------------------------------- */
/* Section heading                                                            */
/* -------------------------------------------------------------------------- */

/**
 * `step` renders the ordinal as a distinct token rather than baking "3." into
 * the label string. The old approach drifted: two panels both claimed step 3,
 * and the DOM order did not match the numbers at all.
 */
export const SectionHeading: React.FC<{
  step?: number;
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  trailing?: React.ReactNode;
}> = ({ step, icon, title, hint, trailing }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-start gap-3 min-w-0">
      {step !== undefined && (
        <span
          aria-hidden="true"
          className="numeral mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--color-line-strong)] bg-white/70 text-[11px] font-semibold text-[var(--color-text-accent)]"
        >
          {step}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 font-sans text-[13px] font-semibold tracking-tight text-[var(--color-text-primary)]">
          {icon && <span className="text-[var(--color-text-accent)]">{icon}</span>}
          {title}
        </h3>
        {hint && (
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    </div>
    {trailing && <div className="shrink-0">{trailing}</div>}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Button                                                                     */
/* -------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BTN_BASE =
  'u-interactive u-press inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] ' +
  'font-sans font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-45';

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--theme-primary)] text-[var(--color-text-onDark)] shadow-[var(--shadow-e1)] ' +
    'hover:shadow-[var(--shadow-e3)] hover:brightness-[1.18] active:brightness-95',
  secondary:
    'bg-white/70 text-[var(--color-text-secondary)] border border-[var(--color-line-strong)] ' +
    'hover:bg-white hover:border-[var(--color-gold-400)] hover:text-[var(--color-text-primary)] hover:shadow-[var(--shadow-e2)]',
  ghost:
    'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-obsidian-100)] hover:text-[var(--color-text-primary)]',
  danger:
    'bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)] border border-[color-mix(in_srgb,var(--color-danger-fg)_25%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-danger-fg)_12%,white)]',
};

/* Minimum 40px tall so every control clears the 44px-ish touch guidance once
   spacing is counted; the old 24-28px chips were well under it. */
const BTN_SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[12px]',
  md: 'h-10 px-4 text-[13px]',
  lg: 'h-12 px-6 text-[14px]',
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    block?: boolean;
  }
>(({ variant = 'secondary', size = 'md', block, className = '', ...rest }, ref) => (
  <button
    ref={ref}
    className={`${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]} ${block ? 'w-full' : ''} ${className}`}
    {...rest}
  />
));
Button.displayName = 'Button';

/** Icon-only button. `label` is required — it becomes the accessible name. */
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; variant?: ButtonVariant }
>(({ label, variant = 'secondary', className = '', children, ...rest }, ref) => (
  <button
    ref={ref}
    aria-label={label}
    title={label}
    className={`${BTN_BASE} ${BTN_VARIANT[variant]} h-10 w-10 p-0 ${className}`}
    {...rest}
  >
    {children}
  </button>
));
IconButton.displayName = 'IconButton';

/* -------------------------------------------------------------------------- */
/* OptionCard — the selectable tile used by size/quality/ease/charm pickers    */
/* -------------------------------------------------------------------------- */

/**
 * Renders as a real radio so arrow keys move between options and screen
 * readers announce "3 of 6". The previous implementation used plain buttons
 * with no selected state exposed to assistive tech.
 */
export const OptionCard: React.FC<{
  selected: boolean;
  onSelect: () => void;
  name: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  swatch?: string;
  align?: 'left' | 'center';
  className?: string;
}> = ({ selected, onSelect, name, title, subtitle, swatch, align = 'left', className = '' }) => (
  <label
    className={`u-interactive u-press relative flex cursor-pointer select-none flex-col justify-center rounded-[var(--radius-sm)] border px-3 py-2.5 ${
      align === 'center' ? 'items-center text-center' : 'items-start text-left'
    } ${
      selected
        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--color-text-onDark)] shadow-[var(--shadow-e2)]'
        : 'border-[var(--color-line)] bg-white/60 text-[var(--color-text-secondary)] hover:border-[var(--color-gold-400)] hover:bg-white hover:shadow-[var(--shadow-e2)]'
    } ${className}`}
  >
    <input
      type="radio"
      name={name}
      checked={selected}
      onChange={onSelect}
      className="sr-only-x"
    />
    {swatch && (
      <span
        aria-hidden="true"
        className="mb-1.5 h-3.5 w-3.5 rounded-full ring-1 ring-black/10 shadow-inner"
        style={{ backgroundColor: swatch }}
      />
    )}
    <span className="text-[13px] font-semibold leading-tight">{title}</span>
    {subtitle && (
      <span
        className={`numeral mt-0.5 text-[11px] leading-tight ${
          selected ? 'text-[var(--color-text-onDark)]/70' : 'text-[var(--color-text-muted)]'
        }`}
      >
        {subtitle}
      </span>
    )}
  </label>
);

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

/** Associates label and control via a generated id — previously `<label>` and
 *  `<input>` were siblings with no linkage, so clicking a label did nothing. */
export const Field: React.FC<{
  label: string;
  hint?: string;
  error?: string;
  children: (id: string) => React.ReactNode;
}> = ({ label, hint, error, children }) => {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="label-micro block">
        {label}
      </label>
      {children(id)}
      {hint && !error && (
        <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-[11px] font-medium text-[var(--color-danger-fg)]">
          {error}
        </p>
      )}
    </div>
  );
};

export const inputClass =
  'u-interactive w-full rounded-[var(--radius-sm)] border border-[var(--color-line-strong)] bg-white/80 ' +
  'px-3 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-obsidian-400)] ' +
  'hover:border-[var(--color-gold-400)] focus:border-[var(--color-gold-600)] focus:bg-white';

/* -------------------------------------------------------------------------- */
/* Segmented control                                                          */
/* -------------------------------------------------------------------------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string }[];
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface-sunken)] p-0.5"
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`u-interactive numeral min-h-[34px] rounded-[var(--radius-xs)] px-3.5 text-[12px] font-semibold ${
              active
                ? 'bg-white text-[var(--color-text-primary)] shadow-[var(--shadow-e1)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Badge / Meter                                                              */
/* -------------------------------------------------------------------------- */

export const Badge: React.FC<{
  children: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}> = ({ children, tone = 'neutral' }) => {
  const tones = {
    neutral: 'bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] border-[var(--color-line)]',
    accent: 'bg-[var(--color-gold-100)] text-[var(--color-text-accent)] border-[var(--color-gold-300)]',
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success-fg)] border-[color-mix(in_srgb,var(--color-success-fg)_22%,transparent)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)] border-[color-mix(in_srgb,var(--color-warning-fg)_22%,transparent)]',
    danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-fg)] border-[color-mix(in_srgb,var(--color-danger-fg)_22%,transparent)]',
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

/** Meter with an explicit fill colour. The old version passed `glass-panel`
 *  as one bar's colour, rendering a translucent white fill on a translucent
 *  white track — permanently invisible regardless of value. */
export const Meter: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{label}</span>
      <span className="numeral text-[12px] font-semibold text-[var(--color-text-muted)]">{value}%</span>
    </div>
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-sunken)] ring-1 ring-inset ring-black/[0.04]"
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          backgroundColor: color,
          transition: 'width var(--dur-slow) var(--ease-out)',
        }}
      />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Modal shell                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Centralises the dialog behaviour every modal previously lacked: Escape to
 * close, focus moved into the dialog on open and restored on close, a focus
 * trap, background scroll lock, and correct dialog semantics. The entrance
 * animation is a local keyframe because `animate-in`/`fade-in` resolved to
 * `animation-name: none` — tailwindcss-animate is not a dependency.
 */
export const ModalShell: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}> = ({ open, onClose, title, subtitle, children, footer, size = 'md' }) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  /* Focus is moved in a layout effect against the panel node itself rather
     than in a rAF against the first focusable child. Under StrictMode the
     effect runs mount → cleanup → mount, and the cleanup's focus-restore was
     racing the queued frame, leaving focus outside the dialog entirely. */
  React.useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(
      'input:not([type="hidden"]):not(.sr-only-x),textarea,select,button:not([aria-label="Close"]),[tabindex]:not([tabindex="-1"])'
    );
    (first ?? panel).focus({ preventScroll: true });
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      /* Only hand focus back to a node still in the document; the trigger may
         have unmounted while the dialog was open. */
      if (previouslyFocused?.isConnected) previouslyFocused.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-5xl' }[size];

  return (
    <div
      className="ab-fade-in fixed inset-0 z-[100] flex items-end justify-center bg-[var(--color-obsidian-950)]/45 p-0 backdrop-blur-md sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`ab-scale-in flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-obsidian-50)] shadow-[var(--shadow-e4)] sm:rounded-[var(--radius-xl)]`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] bg-white/70 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-serif text-[22px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-[12px] text-[var(--color-text-muted)]">{subtitle}</p>
            )}
          </div>
          <IconButton label="Close" variant="ghost" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </IconButton>
        </header>

        <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <footer className="border-t border-[var(--color-line)] bg-white/70 px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};
