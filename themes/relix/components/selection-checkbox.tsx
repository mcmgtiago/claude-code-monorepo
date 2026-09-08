"use client";

import { useEffect, useRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectionCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  indeterminate?: boolean;
};

export function SelectionCheckbox({
  indeterminate = false,
  className,
  ...props
}: SelectionCheckboxProps) {
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.indeterminate = indeterminate && !props.checked;
  }, [indeterminate, props.checked]);

  return <input ref={ref} type="checkbox" className={cn("h-4 w-4 rounded border-slate-300", className)} {...props} />;
}
