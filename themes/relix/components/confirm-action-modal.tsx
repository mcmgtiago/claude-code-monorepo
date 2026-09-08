"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmActionTone = "danger" | "warning" | "neutral";

export type ConfirmActionOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmActionTone;
};

function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone,
  onCancel,
  onConfirm
}: ConfirmActionOptions & {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onCancel, open]);

  useEffect(() => {
    if (!open || !mounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted, open]);

  if (!open || !mounted) {
    return null;
  }

  const toneKey = tone ?? "danger";
  const toneClassNames = {
    danger: {
      iconWrap: "bg-[linear-gradient(180deg,#fff1f2_0%,#ffe4e6_100%)] text-rose-600 ring-1 ring-rose-100",
      panel: "border-rose-100 bg-rose-50/80 text-rose-700",
      button: "bg-rose-600 text-white hover:bg-rose-700"
    },
    warning: {
      iconWrap: "bg-[linear-gradient(180deg,#fff8eb_0%,#ffefc7_100%)] text-amber-700 ring-1 ring-amber-100",
      panel: "border-amber-100 bg-amber-50/85 text-amber-800",
      button: "bg-amber-500 text-white hover:bg-amber-600"
    },
    neutral: {
      iconWrap: "bg-[linear-gradient(180deg,#eef4ff_0%,#dbe8ff_100%)] text-[#386df4] ring-1 ring-[#dbe5fb]",
      panel: "border-[#dbe5fb] bg-[#f7faff] text-slate-700",
      button: "bg-[#386df4] text-white hover:bg-[#2d5de0]"
    }
  }[toneKey];

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(15,23,42,0.28)] px-4 py-8 backdrop-blur-[6px]"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(56,109,244,0.08),transparent_36%),linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]", toneClassNames.iconWrap)}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[1.08rem] font-semibold tracking-tight text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">Review this action before continuing.</p>
              </div>
            </div>
            <button onClick={onCancel} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className={cn("rounded-2xl border px-4 py-4 text-sm leading-6", toneClassNames.panel)}>
            {description}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition", toneClassNames.button)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function useConfirmAction() {
  const [options, setOptions] = useState<ConfirmActionOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };
  }, []);

  const closeDialog = (value: boolean) => {
    if (resolverRef.current) {
      resolverRef.current(value);
      resolverRef.current = null;
    }
    setOptions(null);
  };

  const confirm = (nextOptions: ConfirmActionOptions) =>
    new Promise<boolean>((resolve) => {
      if (resolverRef.current) {
        resolverRef.current(false);
      }

      resolverRef.current = resolve;
      setOptions({
        cancelLabel: "Cancel",
        confirmLabel: "Confirm",
        tone: "danger",
        ...nextOptions
      });
    });

  return {
    confirm,
    confirmationDialog: (
      <ConfirmActionModal
        open={Boolean(options)}
        title={options?.title || ""}
        description={options?.description || ""}
        confirmLabel={options?.confirmLabel || "Confirm"}
        cancelLabel={options?.cancelLabel || "Cancel"}
        tone={options?.tone || "danger"}
        onCancel={() => closeDialog(false)}
        onConfirm={() => closeDialog(true)}
      />
    )
  };
}
