function required(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function numberFromEnv(name: string, fallback?: number) {
  const raw = process.env[name]?.trim();

  if (!raw) {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error(`Missing required environment variable: ${name}`);
  }

  const value = Number(raw);

  if (!Number.isFinite(value)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return value;
}

export const env = {
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
  get NEXT_PUBLIC_SUPABASE_URL() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get SMTP_HOST() {
    return required("SMTP_HOST");
  },
  get SMTP_PORT() {
    return numberFromEnv("SMTP_PORT", 587);
  },
  get SMTP_USER() {
    return required("SMTP_USER");
  },
  get SMTP_PASS() {
    return required("SMTP_PASS");
  },
  get SMTP_FROM() {
    return required("SMTP_FROM");
  },
  get CONTACT_TO_EMAIL() {
    return required("CONTACT_TO_EMAIL");
  },
};
