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
        className={`glass-panel border hairline border-obsidian-200/50 rounded-sm bg-white/60 flex flex-col items-center justify-center text-center gap-3 ${
          compact ? 'p-4' : 'p-8 h-full min-h-[180px]'
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold text-obsidian-900">
            {label} could not be displayed
          </h4>
          <p className="font-mono text-[10px] text-obsidian-400 mt-1 max-w-xs break-words">
            {error.message || 'Unknown error'}
          </p>
          <p className="font-sans text-[11px] text-obsidian-500 mt-2">
            The rest of the studio is still usable.
          </p>
        </div>
        <button
          onClick={this.handleRetry}
          className="flex items-center gap-1.5 px-3.5 py-1.5 border hairline border-obsidian-200/50 rounded-sm font-mono text-[10px] uppercase tracking-[0.18em] text-obsidian-600 hover:text-[var(--theme-primary)] hover:border-gold-400 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
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
          <div
            className={`glass-panel border hairline border-obsidian-200/50 rounded-sm bg-white/40 flex items-center justify-center ${
              compact ? 'p-4' : 'p-8 h-full min-h-[180px]'
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-obsidian-400 animate-pulse">
              Loading {label}…
            </span>
          </div>
        )
      }
    >
      {children}
    </Suspense>
  </ErrorBoundary>
);
