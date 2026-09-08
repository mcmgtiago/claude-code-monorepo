"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { hasRouteSkeletonBeenSeen, normalizeRouteKey, shouldShowRouteSkeleton } from "@/lib/route-skeleton";
import { RouteSkeleton } from "@/components/route-skeletons";

const noSkeletonRoutes = new Set(["/login", "/signup", "/forgot-password", "/reset-password", "/blocked", "/onboarding", "/meet"]);
const authLoadingRoutes = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);
const majorLoadingDelayMs = 700;

function RouteLoadingIndicator() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 overflow-hidden bg-transparent" role="status" aria-live="polite" aria-label="Loading page">
      <div className="h-full w-1/2 animate-[route-loading-slide_1.1s_ease-in-out_infinite] rounded-r-full bg-[#386df4] shadow-[0_0_16px_rgba(56,109,244,0.42)]" />
    </div>
  );
}

function AuthLoadingSurface() {
  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,109,244,0.14),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)]">
      <div className="grid min-h-[100dvh] lg:grid-cols-[1.06fr_0.94fr]">
        <section className="relative hidden min-h-[100dvh] overflow-hidden bg-[#e7f0ff] lg:block">
          <div className="auth-pattern-stage absolute inset-0 overflow-hidden">
            <div className="auth-artwork-loader absolute inset-0" />
            <div className="auth-pattern-photo-wash absolute inset-0" />
          </div>
        </section>

        <section className="auth-form-section relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-5 sm:px-8 lg:px-10">
          <div className="auth-mobile-artwork absolute inset-x-0 top-0 overflow-hidden lg:hidden">
            <div className="auth-pattern-stage absolute inset-0 overflow-hidden">
              <div className="auth-artwork-loader absolute inset-0" />
              <div className="auth-pattern-photo-wash absolute inset-0" />
            </div>
            <div className="auth-mobile-artwork-fade absolute inset-0" />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Loading() {
  const pathname = usePathname();
  const routeKey = normalizeRouteKey(pathname);
  const showSkeleton = !noSkeletonRoutes.has(pathname) && !pathname?.startsWith("/meet/") && shouldShowRouteSkeleton(routeKey);
  const [showFullSkeleton, setShowFullSkeleton] = useState(() => showSkeleton && !hasRouteSkeletonBeenSeen(routeKey));

  useEffect(() => {
    if (!showSkeleton) {
      setShowFullSkeleton(false);
      return;
    }

    if (!hasRouteSkeletonBeenSeen(routeKey)) {
      setShowFullSkeleton(true);
      return;
    }

    setShowFullSkeleton(false);
    const timeoutId = window.setTimeout(() => {
      setShowFullSkeleton(true);
    }, majorLoadingDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [routeKey, showSkeleton]);

  if (!showSkeleton) {
    return authLoadingRoutes.has(pathname) ? <AuthLoadingSurface /> : null;
  }

  if (!showFullSkeleton) {
    return <RouteLoadingIndicator />;
  }

  return (
    <div className="min-h-[calc(100vh-2rem)]">
      <RouteSkeleton routeKey={routeKey} />
    </div>
  );
}
