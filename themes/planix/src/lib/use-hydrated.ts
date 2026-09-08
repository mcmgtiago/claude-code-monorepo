"use client";

import { useEffect, useState } from "react";

let hasHydratedOnce = false;

export function hasClientHydrated() {
  return hasHydratedOnce;
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => hasHydratedOnce);

  useEffect(() => {
    hasHydratedOnce = true;
    setHydrated(true);
  }, []);

  return hydrated;
}
