import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export function Modal({ open, onClose, title, children, className }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-2xl border border-outline-variant/10 bg-surface-container p-6 shadow-2xl',
          className
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title ? (
            <h2 className="text-lg font-bold text-on-surface">{title}</h2>
          ) : (
            <span />
          )}
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            ×
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
