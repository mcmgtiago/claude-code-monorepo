import crypto from "node:crypto";

import { BILLING_PLAN_ORDER, type BillingPlanName } from "@/lib/billing-plans";
import { sendBillingReceiptEmails } from "@/lib/billing-email";
import { PLAN_SETTINGS_PRESETS, defaultPlanSettings, type BillingHistoryItem, type PlanSettings } from "@/lib/settings";

export type { BillingPlanName } from "@/lib/billing-plans";

export type BillingPlanCatalogItem = {
  name: BillingPlanName;
  priceMonthly: number;
  teamMembersLimit: number;
  projectsLimit: number;
  storageLimitGb: number;
  currency: string;
  checkoutAmount: number;
  isPaid: boolean;
};

export type BillingUiConfig = {
  plans: BillingPlanCatalogItem[];
  razorpayEnabled: boolean;
};

type AuthLikeUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
  } | null;
};

type CurrentPlanRow = {
  billing_plan: PlanSettings | null;
};

type ExistingSubscriptionRow = {
  user_id: string;
  workspace_id: string | null;
  workspace_name: string | null;
  plan_name: BillingPlanName;
  plan_price_monthly: number;
  currency: string;
  razorpay_plan_id: string;
  razorpay_subscription_id: string;
  customer_email: string | null;
  user_email: string | null;
  user_name: string | null;
};

type ExistingPaymentRow = {
  id: string;
  status: string;
  razorpay_payment_id: string | null;
};

type RazorpayListResponse<T> = {
  entity: string;
  count: number;
  items: T[];
};

type RazorpayPlanResponse = {
  id: string;
  item: {
    name: string;
    amount: number;
    currency: string;
  };
  period: string;
  interval: number;
  notes?: Record<string, string>;
};

type RazorpaySubscriptionResponse = {
  id: string;
  plan_id: string;
  customer_id?: string | null;
  status: string;
  total_count: number;
  paid_count: number;
  remaining_count?: number | null;
  current_start?: number | null;
  current_end?: number | null;
  charge_at?: number | null;
  start_at?: number | null;
  end_at?: number | null;
  short_url?: string | null;
  customer_notify?: boolean | null;
  notes?: Record<string, string>;
};

type RazorpayPaymentResponse = {
  id: string;
  order_id?: string | null;
  invoice_id?: string | null;
  amount: number;
  currency: string;
  status: string;
  email?: string | null;
  contact?: string | null;
  notes?: Record<string, string>;
};

type BillingSubscriptionCheckoutPayload = {
  keyId: string;
  subscription: {
    id: string;
    status: string;
  };
  plan: BillingPlanCatalogItem;
  prefill: {
    email: string;
    name: string;
    contact: string;
  };
};

type ProcessSubscriptionLifecycleInput = {
  subscription: RazorpaySubscriptionResponse;
  payment?: RazorpayPaymentResponse | null;
  eventType?: string;
  fallbackPlanName?: BillingPlanName;
};

const BASE_BILLING_PLANS: Record<BillingPlanName, Omit<BillingPlanCatalogItem, "currency" | "checkoutAmount" | "isPaid">> = PLAN_SETTINGS_PRESETS;

async function getBillingDbPool() {
  const { getDbPool } = await import("@/lib/db");
  return getDbPool();
}

async function ensureBillingAppUserSettings(userId: string) {
  const { ensureAppUserSettings } = await import("@/lib/settings-db");
  return ensureAppUserSettings(userId);
}

async function ensureBillingUserProfileAndSelectedWorkspace(user: AuthLikeUser) {
  const { ensureUserProfileAndSelectedWorkspace } = await import("@/lib/workspace-selection");
  return ensureUserProfileAndSelectedWorkspace(user);
}

function readTextEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function readNumberEnv(name: string) {
  const raw = readTextEnv(name);

  if (!raw) {
    return null;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function readRequiredRazorpaySecret(name: "RAZORPAY_KEY_ID" | "RAZORPAY_KEY_SECRET") {
  const value = readTextEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readRequiredWebhookSecret() {
  const value = readTextEnv("RAZORPAY_WEBHOOK_SECRET");

  if (!value) {
    throw new Error("Missing required environment variable: RAZORPAY_WEBHOOK_SECRET");
  }

  return value;
}

function getRazorpayCurrency() {
  return readTextEnv("RAZORPAY_CURRENCY").toUpperCase() || "USD";
}

function getConfiguredChargeAmount(planName: BillingPlanName, fallbackPriceMonthly: number) {
  const envKey = planName === "Pro Plan" ? "RAZORPAY_PRO_PLAN_AMOUNT" : planName === "Growth Plan" ? "RAZORPAY_GROWTH_PLAN_AMOUNT" : "";

  if (!envKey) {
    return 0;
  }

  return readNumberEnv(envKey) ?? Math.round(fallbackPriceMonthly * 100);
}

function normalizePlan(value: PlanSettings | null | undefined): PlanSettings {
  return {
    ...defaultPlanSettings,
    ...(value ?? {}),
    billingHistory: Array.isArray(value?.billingHistory) ? value.billingHistory : [],
  };
}

function buildInvoiceNumber(reference: string, invoiceDate: string) {
  return `INV-${invoiceDate.replace(/-/g, "")}-${reference.slice(0, 8).toUpperCase()}`;
}

function timestampToDateString(value?: number | null) {
  if (!value || value <= 0) {
    return "";
  }

  return new Date(value * 1000).toISOString().slice(0, 10);
}

function timestampToIso(value?: number | null) {
  if (!value || value <= 0) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

function normalizeSubscriptionStatus(status?: string | null) {
  return status?.trim().toLowerCase() || "created";
}

function resolvePlanNameFromRaw(value?: string | null): BillingPlanName | null {
  if (value === "Starter Plan" || value === "Pro Plan" || value === "Growth Plan") {
    return value;
  }

  return null;
}

function buildActivePlanFromCatalog(
  currentPlan: PlanSettings,
  plan: BillingPlanCatalogItem,
  renewsOn: string,
  invoice?: BillingHistoryItem,
): PlanSettings {
  const existingHistory = Array.isArray(currentPlan.billingHistory) ? currentPlan.billingHistory : [];
  const nextHistory = invoice && !existingHistory.some((item) => item.razorpayPaymentId && item.razorpayPaymentId === invoice.razorpayPaymentId)
    ? [invoice, ...existingHistory]
    : existingHistory;

  return {
    ...currentPlan,
    name: plan.name,
    priceMonthly: plan.priceMonthly,
    renewsOn,
    teamMembersLimit: plan.teamMembersLimit,
    projectsLimit: plan.projectsLimit,
    storageLimitGb: plan.storageLimitGb,
    billingHistory: nextHistory,
  };
}

function starterPlanSettings(currentPlan: PlanSettings): PlanSettings {
  return {
    ...currentPlan,
    name: defaultPlanSettings.name,
    priceMonthly: defaultPlanSettings.priceMonthly,
    renewsOn: "",
    teamMembersLimit: defaultPlanSettings.teamMembersLimit,
    projectsLimit: defaultPlanSettings.projectsLimit,
    storageLimitGb: defaultPlanSettings.storageLimitGb,
  };
}

export function getBillingPlanCatalog(): BillingPlanCatalogItem[] {
  const currency = getRazorpayCurrency();

  return BILLING_PLAN_ORDER.map((planName) => {
    const plan = BASE_BILLING_PLANS[planName];
    const checkoutAmount = getConfiguredChargeAmount(planName, plan.priceMonthly);

    return {
      ...plan,
      currency,
      checkoutAmount,
      isPaid: checkoutAmount > 0,
    };
  });
}

export function getBillingUiConfig(): BillingUiConfig {
  return {
    plans: getBillingPlanCatalog(),
    razorpayEnabled: isRazorpayConfigured(),
  };
}

export function getBillingPlan(planName: string): BillingPlanCatalogItem | null {
  return getBillingPlanCatalog().find((plan) => plan.name === planName) ?? null;
}

export function isRazorpayConfigured() {
  return Boolean(readTextEnv("RAZORPAY_KEY_ID") && readTextEnv("RAZORPAY_KEY_SECRET"));
}

export function isRazorpayWebhookConfigured() {
  return Boolean(readTextEnv("RAZORPAY_WEBHOOK_SECRET"));
}

export function formatBillingAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBillingSubunitAmount(amountSubunits: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountSubunits / 100);
}

async function razorpayRequest<T>(path: string, init?: RequestInit) {
  const keyId = readRequiredRazorpaySecret("RAZORPAY_KEY_ID");
  const keySecret = readRequiredRazorpaySecret("RAZORPAY_KEY_SECRET");
  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  const payload = text.trim() ? JSON.parse(text) as T & { error?: { description?: string } } : null;

  if (!response.ok) {
    throw new Error(payload?.error?.description || "Razorpay request failed.");
  }

  return payload as T;
}

async function fetchCurrentPlan(userId: string) {
  await ensureBillingAppUserSettings(userId);
  const pool = await getBillingDbPool();
  const result = await pool.query<CurrentPlanRow>(
    `
      select billing_plan
      from public.app_user_settings
      where user_id = $1
      limit 1
    `,
    [userId],
  );

  return normalizePlan(result.rows[0]?.billing_plan);
}

async function fetchExistingSubscriptionBySubscriptionId(subscriptionId: string) {
  const pool = await getBillingDbPool();
  const result = await pool.query<ExistingSubscriptionRow>(
    `
      select
        s.user_id::text,
        s.workspace_id::text,
        w.name as workspace_name,
        s.plan_name,
        s.plan_price_monthly::float8 as plan_price_monthly,
        s.currency,
        s.razorpay_plan_id,
        s.razorpay_subscription_id,
        s.customer_email,
        up.email as user_email,
        coalesce(nullif(trim(up.full_name), ''), nullif(trim(up.first_name), ''), split_part(up.email, '@', 1)) as user_name
      from public.app_billing_subscriptions s
      left join public.workspaces w on w.id = s.workspace_id
      left join public.user_profiles up on up.id = s.user_id
      where s.razorpay_subscription_id = $1
      limit 1
    `,
    [subscriptionId],
  );

  return result.rows[0] ?? null;
}

async function fetchExistingPayment(paymentId: string) {
  const pool = await getBillingDbPool();
  const result = await pool.query<ExistingPaymentRow>(
    `
      select id::text, status, razorpay_payment_id
      from public.app_billing_payments
      where razorpay_payment_id = $1
      limit 1
    `,
    [paymentId],
  );

  return result.rows[0] ?? null;
}

async function fetchRazorpayPlans() {
  const response = await razorpayRequest<RazorpayListResponse<RazorpayPlanResponse>>("/v1/plans?count=100", {
    method: "GET",
  });

  return Array.isArray(response.items) ? response.items : [];
}

async function ensureRazorpayPlan(plan: BillingPlanCatalogItem) {
  const existingPlans = await fetchRazorpayPlans();
  const matched = existingPlans.find((item) =>
    item.item?.name === plan.name
    && item.item?.amount === plan.checkoutAmount
    && item.item?.currency === plan.currency
    && item.period === "monthly"
    && item.interval === 1,
  );

  if (matched) {
    return matched;
  }

  return razorpayRequest<RazorpayPlanResponse>("/v1/plans", {
    method: "POST",
    body: JSON.stringify({
      period: "monthly",
      interval: 1,
      item: {
        name: plan.name,
        amount: plan.checkoutAmount,
        currency: plan.currency,
        description: `${plan.name} monthly subscription`,
      },
      notes: {
        plan_name: plan.name,
      },
    }),
  });
}

export async function createBillingOrder(user: AuthLikeUser, planName: BillingPlanName): Promise<BillingSubscriptionCheckoutPayload> {
  const plan = getBillingPlan(planName);

  if (!plan) {
    throw new Error("Selected plan could not be found.");
  }

  if (!plan.isPaid) {
    throw new Error("Starter Plan does not require Razorpay checkout.");
  }

  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay is not configured.");
  }

  const { workspaceId } = await ensureBillingUserProfileAndSelectedWorkspace(user);
  const razorpayPlan = await ensureRazorpayPlan(plan);
  const subscription = await razorpayRequest<RazorpaySubscriptionResponse>("/v1/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: razorpayPlan.id,
      total_count: 120,
      quantity: 1,
      customer_notify: 1,
      notes: {
        plan_name: plan.name,
        workspace_id: workspaceId,
        user_id: user.id,
      },
    }),
  });

  const pool = await getBillingDbPool();
  await pool.query(
    `
      insert into public.app_billing_subscriptions (
        user_id,
        workspace_id,
        plan_name,
        plan_price_monthly,
        currency,
        razorpay_plan_id,
        razorpay_subscription_id,
        customer_email,
        status,
        total_count,
        paid_count,
        remaining_count,
        current_start_at,
        current_end_at,
        charge_at,
        start_at,
        end_at,
        short_url,
        customer_notify
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      on conflict (razorpay_subscription_id)
      do update set
        plan_name = excluded.plan_name,
        plan_price_monthly = excluded.plan_price_monthly,
        currency = excluded.currency,
        razorpay_plan_id = excluded.razorpay_plan_id,
        customer_email = excluded.customer_email,
        status = excluded.status,
        total_count = excluded.total_count,
        paid_count = excluded.paid_count,
        remaining_count = excluded.remaining_count,
        current_start_at = excluded.current_start_at,
        current_end_at = excluded.current_end_at,
        charge_at = excluded.charge_at,
        start_at = excluded.start_at,
        end_at = excluded.end_at,
        short_url = excluded.short_url,
        customer_notify = excluded.customer_notify,
        updated_at = now()
    `,
    [
      user.id,
      workspaceId,
      plan.name,
      plan.priceMonthly,
      plan.currency,
      razorpayPlan.id,
      subscription.id,
      user.email?.trim().toLowerCase() || null,
      normalizeSubscriptionStatus(subscription.status),
      subscription.total_count,
      subscription.paid_count,
      subscription.remaining_count ?? null,
      timestampToIso(subscription.current_start),
      timestampToIso(subscription.current_end),
      timestampToIso(subscription.charge_at),
      timestampToIso(subscription.start_at),
      timestampToIso(subscription.end_at),
      subscription.short_url ?? null,
      Boolean(subscription.customer_notify),
    ],
  );

  return {
    keyId: readRequiredRazorpaySecret("RAZORPAY_KEY_ID"),
    subscription: {
      id: subscription.id,
      status: normalizeSubscriptionStatus(subscription.status),
    },
    plan,
    prefill: {
      email: user.email?.trim() || "",
      name: user.user_metadata?.full_name?.trim() || "",
      contact: user.user_metadata?.phone?.trim() || "",
    },
  };
}

export function verifyRazorpayPaymentSignature(input: {
  subscriptionId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = readRequiredRazorpaySecret("RAZORPAY_KEY_SECRET");
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${input.paymentId}|${input.subscriptionId}`)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(input.signature));
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string) {
  const secret = readRequiredWebhookSecret();
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature));
}

export async function fetchRazorpayPayment(paymentId: string) {
  return razorpayRequest<RazorpayPaymentResponse>(`/v1/payments/${paymentId}`, {
    method: "GET",
  });
}

export async function fetchRazorpaySubscription(subscriptionId: string) {
  return razorpayRequest<RazorpaySubscriptionResponse>(`/v1/subscriptions/${subscriptionId}`, {
    method: "GET",
  });
}

async function recordBillingCharge(options: {
  subscription: RazorpaySubscriptionResponse;
  plan: BillingPlanCatalogItem;
  existingSubscription: ExistingSubscriptionRow;
  payment: RazorpayPaymentResponse;
  eventType?: string;
}) {
  const priorPayment = await fetchExistingPayment(options.payment.id);
  const pool = await getBillingDbPool();
  const generatedReceipt = options.payment.invoice_id
    || options.payment.order_id
    || `receipt_${options.subscription.id}_${options.payment.id}`;

  await pool.query(
    `
      insert into public.app_billing_payments (
        user_id,
        workspace_id,
        plan_name,
        plan_price_monthly,
        currency,
        amount_subunits,
        receipt,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id,
        razorpay_plan_id,
        razorpay_invoice_id,
        customer_email,
        source_event,
        status
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, null, $10, $11, $12, $13, $14, $15)
      on conflict (razorpay_payment_id)
      do update set
        plan_name = excluded.plan_name,
        plan_price_monthly = excluded.plan_price_monthly,
        currency = excluded.currency,
        amount_subunits = excluded.amount_subunits,
        receipt = excluded.receipt,
        razorpay_order_id = excluded.razorpay_order_id,
        razorpay_subscription_id = excluded.razorpay_subscription_id,
        razorpay_plan_id = excluded.razorpay_plan_id,
        razorpay_invoice_id = excluded.razorpay_invoice_id,
        customer_email = excluded.customer_email,
        source_event = excluded.source_event,
        status = excluded.status,
        updated_at = now()
    `,
    [
      options.existingSubscription.user_id,
      options.existingSubscription.workspace_id,
      options.plan.name,
      options.plan.priceMonthly,
      options.payment.currency || options.plan.currency,
      options.payment.amount,
      generatedReceipt,
      options.payment.order_id ?? null,
      options.payment.id,
      options.subscription.id,
      options.subscription.plan_id,
      options.payment.invoice_id ?? null,
      options.payment.email?.trim().toLowerCase()
        || options.existingSubscription.customer_email
        || options.existingSubscription.user_email
        || null,
      options.eventType ?? "subscription.charge",
      options.payment.status,
    ],
  );

  return {
    isNewPayment: !priorPayment,
    invoice: {
      id: buildInvoiceNumber(options.payment.id, new Date().toISOString().slice(0, 10)),
      date: new Date().toISOString().slice(0, 10),
      amount: formatBillingSubunitAmount(options.payment.amount, options.payment.currency || options.plan.currency),
      status: "Paid",
      invoiceNumber: buildInvoiceNumber(options.payment.id, new Date().toISOString().slice(0, 10)),
      currency: options.payment.currency || options.plan.currency,
      planName: options.plan.name,
      renewalDate: timestampToDateString(options.subscription.current_end),
      receipt: generatedReceipt,
      amountSubunits: options.payment.amount,
      razorpayOrderId: options.payment.order_id ?? undefined,
      razorpayPaymentId: options.payment.id,
    } satisfies BillingHistoryItem,
  };
}

async function upsertBillingSubscriptionRecord(options: {
  subscription: RazorpaySubscriptionResponse;
  plan: BillingPlanCatalogItem;
  existingSubscription: ExistingSubscriptionRow;
  customerEmail?: string | null;
}) {
  const pool = await getBillingDbPool();
  await pool.query(
    `
      insert into public.app_billing_subscriptions (
        user_id,
        workspace_id,
        plan_name,
        plan_price_monthly,
        currency,
        razorpay_plan_id,
        razorpay_subscription_id,
        customer_id,
        customer_email,
        status,
        total_count,
        paid_count,
        remaining_count,
        current_start_at,
        current_end_at,
        charge_at,
        start_at,
        end_at,
        short_url,
        customer_notify
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      on conflict (razorpay_subscription_id)
      do update set
        plan_name = excluded.plan_name,
        plan_price_monthly = excluded.plan_price_monthly,
        currency = excluded.currency,
        razorpay_plan_id = excluded.razorpay_plan_id,
        customer_id = excluded.customer_id,
        customer_email = excluded.customer_email,
        status = excluded.status,
        total_count = excluded.total_count,
        paid_count = excluded.paid_count,
        remaining_count = excluded.remaining_count,
        current_start_at = excluded.current_start_at,
        current_end_at = excluded.current_end_at,
        charge_at = excluded.charge_at,
        start_at = excluded.start_at,
        end_at = excluded.end_at,
        short_url = excluded.short_url,
        customer_notify = excluded.customer_notify,
        updated_at = now()
    `,
    [
      options.existingSubscription.user_id,
      options.existingSubscription.workspace_id,
      options.plan.name,
      options.plan.priceMonthly,
      options.plan.currency,
      options.subscription.plan_id,
      options.subscription.id,
      options.subscription.customer_id ?? null,
      options.customerEmail ?? options.existingSubscription.customer_email ?? options.existingSubscription.user_email ?? null,
      normalizeSubscriptionStatus(options.subscription.status),
      options.subscription.total_count,
      options.subscription.paid_count,
      options.subscription.remaining_count ?? null,
      timestampToIso(options.subscription.current_start),
      timestampToIso(options.subscription.current_end),
      timestampToIso(options.subscription.charge_at),
      timestampToIso(options.subscription.start_at),
      timestampToIso(options.subscription.end_at),
      options.subscription.short_url ?? null,
      Boolean(options.subscription.customer_notify),
    ],
  );
}

function isActiveBillingState(status: string) {
  return ["created", "authenticated", "active", "pending", "halted", "paused", "resumed"].includes(status);
}

function isTerminalBillingState(status: string) {
  return ["cancelled", "completed", "expired"].includes(status);
}

async function sendBillingReceiptIfNeeded(options: {
  existingSubscription: ExistingSubscriptionRow;
  payment: RazorpayPaymentResponse;
  plan: BillingPlanCatalogItem;
  invoice: BillingHistoryItem;
}) {
  const userEmail = (
    options.payment.email?.trim()
    || options.existingSubscription.customer_email?.trim()
    || options.existingSubscription.user_email?.trim()
    || ""
  ).toLowerCase();

  if (!userEmail) {
    return;
  }

  await sendBillingReceiptEmails({
    userEmail,
    userName: options.existingSubscription.user_name,
    workspaceId: options.existingSubscription.workspace_id,
    workspaceName: options.existingSubscription.workspace_name,
    planName: options.plan.name,
    displayAmount: options.invoice.amount,
    currency: options.invoice.currency || options.plan.currency,
    amountSubunits: options.invoice.amountSubunits || options.plan.checkoutAmount,
    invoiceNumber: options.invoice.invoiceNumber || options.invoice.id,
    invoiceDate: options.invoice.date,
    renewsOn: options.invoice.renewalDate,
    razorpayOrderId: options.invoice.razorpayOrderId || "",
    razorpayPaymentId: options.invoice.razorpayPaymentId || options.payment.id,
    receipt: options.invoice.receipt || options.payment.invoice_id || options.payment.id,
    razorpayEmail: options.payment.email,
  });
}

async function processBillingSubscriptionLifecycle(input: ProcessSubscriptionLifecycleInput) {
  const existingSubscription = await fetchExistingSubscriptionBySubscriptionId(input.subscription.id);

  if (!existingSubscription) {
    throw new Error("Billing subscription could not be found.");
  }

  const planName = resolvePlanNameFromRaw(existingSubscription.plan_name)
    || resolvePlanNameFromRaw(input.subscription.notes?.plan_name)
    || input.fallbackPlanName
    || "Starter Plan";
  const plan = getBillingPlan(planName);

  if (!plan) {
    throw new Error("Billing plan could not be resolved.");
  }

  await upsertBillingSubscriptionRecord({
    subscription: input.subscription,
    plan,
    existingSubscription,
    customerEmail: input.payment?.email,
  });

  const currentPlan = await fetchCurrentPlan(existingSubscription.user_id);
  let invoice: BillingHistoryItem | undefined;

  if (input.payment && ["captured", "authorized", "paid"].includes(input.payment.status)) {
    const charge = await recordBillingCharge({
      subscription: input.subscription,
      plan,
      existingSubscription,
      payment: input.payment,
      eventType: input.eventType,
    });

    invoice = charge.invoice;

    if (charge.isNewPayment) {
      try {
        await sendBillingReceiptIfNeeded({
          existingSubscription,
          payment: input.payment,
          plan,
          invoice: charge.invoice,
        });
      } catch (error) {
        console.error("Failed to send billing receipt emails", error);
      }
    }
  }

  const normalizedStatus = normalizeSubscriptionStatus(input.subscription.status);
  const renewsOn = timestampToDateString(input.subscription.current_end);
  const nextPlan = isTerminalBillingState(normalizedStatus)
    ? starterPlanSettings(currentPlan)
    : isActiveBillingState(normalizedStatus)
      ? buildActivePlanFromCatalog(currentPlan, plan, renewsOn || currentPlan.renewsOn, invoice)
      : currentPlan;

  await ensureBillingAppUserSettings(existingSubscription.user_id);
  const pool = await getBillingDbPool();
  await pool.query(
    `
      update public.app_user_settings
      set billing_plan = $2::jsonb
      where user_id = $1
    `,
    [existingSubscription.user_id, JSON.stringify(nextPlan)],
  );

  return nextPlan;
}

export async function finalizePaidPlanPurchase(userId: string, input: {
  subscriptionId: string;
  paymentId: string;
  signature: string;
  planName: BillingPlanName;
}) {
  if (!verifyRazorpayPaymentSignature(input)) {
    throw new Error("Payment signature verification failed.");
  }

  const existingSubscription = await fetchExistingSubscriptionBySubscriptionId(input.subscriptionId);

  if (!existingSubscription || existingSubscription.user_id !== userId) {
    throw new Error("Billing subscription could not be found.");
  }

  const subscription = await fetchRazorpaySubscription(input.subscriptionId);
  const payment = await fetchRazorpayPayment(input.paymentId);

  if (payment.status !== "captured" && payment.status !== "authorized") {
    throw new Error("Payment was not captured successfully.");
  }

  return processBillingSubscriptionLifecycle({
    subscription,
    payment,
    eventType: "subscription.checkout.confirmed",
    fallbackPlanName: input.planName,
  });
}

export async function handleBillingWebhookEvent(event: {
  event: string;
  payload?: {
    subscription?: {
      entity?: RazorpaySubscriptionResponse;
    };
    payment?: {
      entity?: RazorpayPaymentResponse;
    };
  };
}) {
  const subscription = event.payload?.subscription?.entity;

  if (!subscription?.id) {
    return null;
  }

  return processBillingSubscriptionLifecycle({
    subscription,
    payment: event.payload?.payment?.entity ?? null,
    eventType: event.event,
    fallbackPlanName: resolvePlanNameFromRaw(subscription.notes?.plan_name ?? null) ?? undefined,
  });
}
