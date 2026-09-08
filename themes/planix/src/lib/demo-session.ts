export const DEMO_LOGIN = {
  email: "demo@planix.app",
  password: "PlanixDemo@123",
} as const;

export const LEGACY_DEMO_LOGIN = {
  email: "demo@planique.app",
  password: "PlaniqueDemo@123",
} as const;

export const DEMO_SESSION_COOKIE = "planix_demo_session";
export const LEGACY_DEMO_SESSION_COOKIE = "planique_demo_session";
export const DEMO_SESSION_VALUE = "demo-session-v1";
export const DEMO_SETTINGS_COOKIE = "planix_demo_settings";
export const LEGACY_DEMO_SETTINGS_COOKIE = "planique_demo_settings";
export const DEMO_PROFILE_COOKIE = "planix_demo_profile";
export const LEGACY_DEMO_PROFILE_COOKIE = "planique_demo_profile";

export const DEMO_SESSION_COOKIE_NAMES = [DEMO_SESSION_COOKIE, LEGACY_DEMO_SESSION_COOKIE] as const;
export const DEMO_SETTINGS_COOKIE_NAMES = [DEMO_SETTINGS_COOKIE, LEGACY_DEMO_SETTINGS_COOKIE] as const;
export const DEMO_PROFILE_COOKIE_NAMES = [DEMO_PROFILE_COOKIE, LEGACY_DEMO_PROFILE_COOKIE] as const;

type CookieStoreLike = {
  get: (name: string) => { value?: string } | undefined;
};

export function getCompatibleDemoCookieNames(cookieName: string) {
  if (cookieName === DEMO_SESSION_COOKIE) {
    return [...DEMO_SESSION_COOKIE_NAMES];
  }

  if (cookieName === DEMO_SETTINGS_COOKIE) {
    return [...DEMO_SETTINGS_COOKIE_NAMES];
  }

  if (cookieName === DEMO_PROFILE_COOKIE) {
    return [...DEMO_PROFILE_COOKIE_NAMES];
  }

  return [cookieName];
}

export function readDemoCookie(cookieStore: CookieStoreLike, cookieName: string) {
  for (const candidateName of getCompatibleDemoCookieNames(cookieName)) {
    const value = cookieStore.get(candidateName)?.value;

    if (typeof value === "string") {
      return value;
    }
  }

  return undefined;
}

export function isDemoLogin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return [DEMO_LOGIN, LEGACY_DEMO_LOGIN].some((credentials) =>
    normalizedEmail === credentials.email && password === credentials.password,
  );
}

export function hasDemoSessionCookie(value: string | undefined) {
  return value === DEMO_SESSION_VALUE;
}
