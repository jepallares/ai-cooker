'use client';

type Variant = 'info' | 'warning' | 'success' | 'error';

const variantStyles: Record<Variant, { wrapper: string; icon: string }> = {
  info:    { wrapper: 'bg-blue-50 border-blue-200 text-blue-800',   icon: 'ℹ️' },
  warning: { wrapper: 'bg-amber-50 border-amber-200 text-amber-800', icon: '⚠️' },
  success: { wrapper: 'bg-green-50 border-green-200 text-green-800', icon: '✓' },
  error:   { wrapper: 'bg-red-50 border-red-200 text-red-800',       icon: '✕' },
};

type Props = {
  variant?: Variant;
  title?: string;
  message: string;
  /** Primary action button label */
  actionLabel?: string;
  onAction?: () => void;
  /** Secondary action button label */
  secondaryLabel?: string;
  onSecondary?: () => void;
  onDismiss?: () => void;
};

/** Reusable alert banner with optional primary and secondary action buttons. */
export default function AlertBanner({
  variant = 'info',
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  onDismiss,
}: Props) {
  const { wrapper, icon } = variantStyles[variant];

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 ${wrapper}`}>
      <span className="mt-0.5 text-base leading-none">{icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold mb-0.5">{title}</p>}
        <p className="text-sm leading-snug">{message}</p>
        {(actionLabel || secondaryLabel) && (
          <div className="flex gap-2 mt-2">
            {actionLabel && (
              <button
                onClick={onAction}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-current opacity-80 hover:opacity-100 transition-opacity"
              >
                {actionLabel}
              </button>
            )}
            {secondaryLabel && (
              <button
                onClick={onSecondary}
                className="text-xs font-medium px-3 py-1 rounded-full hover:bg-black/5 transition-colors"
              >
                {secondaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-current opacity-50 hover:opacity-100 transition-opacity text-lg leading-none">
          ×
        </button>
      )}
    </div>
  );
}
