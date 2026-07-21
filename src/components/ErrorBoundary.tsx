import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  /** Human-readable name of the section, shown in the fallback. */
  label: string;
  children: ReactNode;
  /** Renders a smaller fallback for tight spaces like the modal shell. */
  compact?: boolean;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render/lifecycle errors from one section so a single failing panel
 * degrades to an inline message instead of unmounting the whole page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.label}] section failed:`, error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const { label, compact } = this.props;

    return (
      <div
        role="alert"
        className={`panel flex flex-col items-center justify-center gap-3 text-center ${
          compact ? 'p-4' : 'h-full min-h-[180px] p-8'
        }`}
      >
        <div className="grid h-9 w-9 place-items-center rounded-full border border-[color-mix(in_srgb,var(--color-warning-fg)_25%,transparent)] bg-[var(--color-warning-bg)] text-[var(--color-warning-fg)]">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-serif text-[16px] font-semibold text-[var(--color-text-primary)]">
            {label} could not be displayed
          </h4>
          <p className="numeral mt-1 max-w-xs break-words text-[11px] text-[var(--color-text-muted)]">
            {error.message || 'Unknown error'}
          </p>
          <p className="mt-2 text-[12px] text-[var(--color-text-secondary)]">
            The rest of the studio is still usable.
          </p>
        </div>
        <button
          onClick={this.handleRetry}
          className="u-interactive u-press inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-line-strong)] bg-white/70 px-3.5 py-2 text-[12px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold-400)] hover:text-[var(--color-text-primary)]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }
}

interface SafeSectionProps extends ErrorBoundaryProps {
  /** Shown while the lazy chunk loads. Defaults to a neutral skeleton. */
  fallback?: ReactNode;
}

/**
 * ErrorBoundary + Suspense in one wrapper. Every lazy component needs both:
 * the boundary for throws, the Suspense for chunk loading. Previously all
 * Suspense fallbacks were `null`, so a failed chunk rendered nothing at all.
 */
export const SafeSection: React.FC<SafeSectionProps> = ({ label, children, compact, fallback }) => (
  <ErrorBoundary label={label} compact={compact}>
    <Suspense
      fallback={
        fallback ?? (
          /* A shaped skeleton rather than a text string, so the layout does not
             jump when the real panel arrives. */
          <div
            aria-busy="true"
            aria-label={`Loading ${label}`}
            className={`panel ${compact ? 'p-4' : 'h-full min-h-[180px] p-6'}`}
          >
            <div className="ab-skeleton h-3 w-1/3 rounded-full" />
            <div className="ab-skeleton mt-3 h-2.5 w-2/3 rounded-full" />
            <div className="ab-skeleton mt-5 h-9 w-full rounded-[var(--radius-sm)]" />
            <div className="ab-skeleton mt-2 h-9 w-full rounded-[var(--radius-sm)]" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  </ErrorBoundary>
);
