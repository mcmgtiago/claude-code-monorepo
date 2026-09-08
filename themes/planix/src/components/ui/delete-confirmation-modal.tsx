"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

import { ModalCloseButton } from "@/components/ui/modal-close-button";

type DeleteConfirmationModalProps = {
  open: boolean;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmationLabel?: string;
  confirmationKeyword?: string;
  errorMessage?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteConfirmationModal({
  open,
  title = "Delete item?",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  confirmationLabel,
  confirmationKeyword,
  errorMessage,
  isConfirming = false,
  onConfirm,
  onClose,
}: DeleteConfirmationModalProps) {
  const [confirmationValue, setConfirmationValue] = useState("");

  useEffect(() => {
    if (!open) {
      setConfirmationValue("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const requiresConfirmation = Boolean(confirmationKeyword);
  const canConfirm = !requiresConfirmation || confirmationValue.trim() === confirmationKeyword;

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={onClose} />
      <div className="modal-surface modal-surface-scroll max-w-[500px] border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-8">
        <ModalCloseButton absolute onClick={onClose} aria-label="Close delete confirmation" />

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--red)]/20 bg-[var(--red)]/10 text-[var(--red)]">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <h2 className="text-[1.35rem] font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{description}</p>

        {requiresConfirmation ? (
          <div className="mt-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {confirmationLabel ?? `Type ${confirmationKeyword} to continue`}
            </p>
            <input
              value={confirmationValue}
              onChange={(event) => setConfirmationValue(event.target.value)}
              placeholder={confirmationKeyword}
              className="mt-2 w-full rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/60"
            />
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--red)]/20 bg-[var(--red)]/8 px-4 py-3 text-sm text-[var(--red)]">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm || isConfirming}
            className="btn-base flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--red)]/20 bg-[var(--red)]/12 py-[15px] text-sm font-semibold text-[var(--red)] transition hover:bg-[var(--red)]/16 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Trash2 className="h-4 w-4" />
            {isConfirming ? "Deleting..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-medium text-[var(--text-primary)]"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
