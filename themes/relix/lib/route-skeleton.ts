const skeletonRouteKeys = new Set([
  "/",
  "/analytics",
  "/pipeline",
  "/companies",
  "/companies/detail",
  "/contacts",
  "/contacts/detail",
  "/leads",
  "/tasks",
  "/meetings",
  "/inbox",
  "/team",
  "/notifications",
  "/settings",
  "/superuser"
]);
const storagePrefix = "crm-route-skeleton-seen:";
const seenInRuntime = new Set<string>();

export function normalizeRouteKey(pathname: string | null): string {
  const cleanPathname = pathname?.split(/[?#]/)[0] || "/";
  if (cleanPathname === "/") return "/";
  const segments = cleanPathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  if ((firstSegment === "companies" || firstSegment === "contacts") && segments.length > 1) {
    return `/${firstSegment}/detail`;
  }
  if (firstSegment === "meet") return "/meet";
  return firstSegment ? `/${firstSegment}` : "/";
}

export function shouldShowRouteSkeleton(routeKey: string): boolean {
  return skeletonRouteKeys.has(routeKey);
}

export function hasRouteSkeletonBeenSeen(routeKey: string): boolean {
  if (!shouldShowRouteSkeleton(routeKey)) {
    return true;
  }

  if (seenInRuntime.has(routeKey)) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(`${storagePrefix}${routeKey}`) === "true";
}

export function markRouteSkeletonSeen(routeKey: string): void {
  if (!shouldShowRouteSkeleton(routeKey)) {
    return;
  }

  seenInRuntime.add(routeKey);

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(`${storagePrefix}${routeKey}`, "true");
  }
}
