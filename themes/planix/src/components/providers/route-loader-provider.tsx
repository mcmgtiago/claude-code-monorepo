"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AppLoader } from "@/components/ui/app-loader";

type RouteLoaderContextValue = {
  showLoader: (label?: string, detail?: string, options?: { delayMs?: number }) => void;
  hideLoader: (delayMs?: number) => void;
};

type LoaderPhase = "visible" | "closing" | "hidden";

const DEFAULT_LABEL = "Loading workspace";
const DEFAULT_DETAIL = "Preparing your latest view";
const EXIT_DURATION_MS = 240;

const RouteLoaderContext = createContext<RouteLoaderContextValue | null>(null);

export function RouteLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const showDelayTimerRef = useRef<number | null>(null);
  const hideDelayTimerRef = useRef<number | null>(null);
  const hideExitTimerRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<LoaderPhase>("hidden");
  const [copy, setCopy] = useState({ label: DEFAULT_LABEL, detail: DEFAULT_DETAIL });

  const clearTimers = useCallback(() => {
    if (showDelayTimerRef.current !== null) {
      window.clearTimeout(showDelayTimerRef.current);
      showDelayTimerRef.current = null;
    }
    if (hideDelayTimerRef.current !== null) {
      window.clearTimeout(hideDelayTimerRef.current);
      hideDelayTimerRef.current = null;
    }
    if (hideExitTimerRef.current !== null) {
      window.clearTimeout(hideExitTimerRef.current);
      hideExitTimerRef.current = null;
    }
  }, []);

  const showLoader = useCallback(
    (
      label = DEFAULT_LABEL,
      detail = DEFAULT_DETAIL,
      options?: { delayMs?: number },
    ) => {
      clearTimers();
      setCopy({ label, detail });

      const delayMs = options?.delayMs ?? 0;

      if (delayMs <= 0) {
        setPhase("visible");
        return;
      }

      showDelayTimerRef.current = window.setTimeout(() => {
        setPhase("visible");
        showDelayTimerRef.current = null;
      }, delayMs);
    },
    [clearTimers],
  );

  const hideLoader = useCallback(
    (delayMs = 0) => {
      clearTimers();
      hideDelayTimerRef.current = window.setTimeout(() => {
        setPhase((currentPhase) => (currentPhase === "hidden" ? currentPhase : "closing"));
        hideExitTimerRef.current = window.setTimeout(() => {
          setPhase("hidden");
        }, EXIT_DURATION_MS);
      }, delayMs);
    },
    [clearTimers],
  );

  useEffect(() => clearTimers, [clearTimers]);

  const value = useMemo(
    () => ({
      showLoader,
      hideLoader,
    }),
    [hideLoader, showLoader],
  );

  return (
    <RouteLoaderContext.Provider value={value}>
      {children}
      {phase !== "hidden" && (
        <AppLoader
          label={copy.label}
          detail={copy.detail}
          closing={phase === "closing"}
        />
      )}
    </RouteLoaderContext.Provider>
  );
}

export function useRouteLoader() {
  const context = useContext(RouteLoaderContext);

  if (!context) {
    return {
      showLoader: () => undefined,
      hideLoader: () => undefined,
    };
  }

  return context;
}
