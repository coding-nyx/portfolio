import { lazy, Suspense, useRef } from 'react';
import ErrorBoundary from '../../shared/ui/ErrorBoundary.jsx';
import useRookDialog from './useRookDialog.js';
import './rook.css';

const RookDialog = lazy(() => import('./RookDialog.jsx'));

function RookLoading({ onOpenChange, returnFocusRef, failed = false }) {
  const closeButton = useRef(null);
  const { panel, close } = useRookDialog({
    onOpenChange,
    returnFocusRef,
    initialFocusRef: closeButton,
  });
  return (
    <>
      <div className="rook-scrim" onClick={close} />
      <div
        ref={panel}
        className="rook-popover"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rook-loading-title"
      >
        <div className="rook-header">
          <h2 id="rook-loading-title">Rook</h2>
          <button
            ref={closeButton}
            className="rook-close"
            type="button"
            aria-label="Close Rook"
            onClick={close}
          >
            ×
          </button>
        </div>
        <p className="rook-status" role="status">
          {failed
            ? 'Rook is unavailable. Please use the Contact section to get in touch.'
            : 'Loading Rook…'}
        </p>
      </div>
    </>
  );
}

export default function RookFeature({
  requested,
  open,
  onOpenChange,
  returnFocusRef,
  onOpenResume,
  onNavigate,
}) {
  if (!requested) return null;
  return (
    <ErrorBoundary
      fallback={
        open ? (
          <RookLoading onOpenChange={onOpenChange} returnFocusRef={returnFocusRef} failed />
        ) : null
      }
    >
      <Suspense
        fallback={
          open ? <RookLoading onOpenChange={onOpenChange} returnFocusRef={returnFocusRef} /> : null
        }
      >
        <RookDialog
          open={open}
          onOpenChange={onOpenChange}
          returnFocusRef={returnFocusRef}
          onOpenResume={onOpenResume}
          onNavigate={onNavigate}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
