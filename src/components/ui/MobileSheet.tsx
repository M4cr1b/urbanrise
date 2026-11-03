"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import { X } from "lucide-react";

/** Native modal keeps mobile panels above the app shell and traps keyboard focus. */
export function MobileSheet({ open, onClose, title, children, footer, returnFocusRef }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!open) { dialog.close(); return; }
    const trigger = returnFocusRef?.current ?? document.activeElement as HTMLElement | null;
    const main = document.getElementById("workbench-main");
    const bodyOverflow = document.body.style.overflow;
    const mainOverflow = main?.style.overflow;
    document.body.style.overflow = "hidden";
    if (main) main.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = bodyOverflow;
      if (main) main.style.overflow = mainOverflow ?? "";
      trigger?.focus({ preventScroll: true });
    };
  }, [open, returnFocusRef]);

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} className="mobile-sheet"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const box = event.currentTarget.getBoundingClientRect();
        if (event.clientY < box.top || event.clientY > box.bottom || event.clientX < box.left || event.clientX > box.right) onClose();
      }}>
      <div className="flex max-h-[inherit] flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant/40 px-5 py-3">
          <h2 id={titleId} className="font-headline text-xl font-bold text-primary">{title}</h2>
          <button type="button" onClick={onClose} aria-label={`Close ${title.toLowerCase()}`} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-5">{children}</div>
        {footer && <div className="sheet-footer shrink-0 border-t border-outline-variant/40 bg-surface-container-lowest px-5 pt-3">{footer}</div>}
      </div>
    </dialog>
  );
}
