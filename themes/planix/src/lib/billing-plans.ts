export const BILLING_PLAN_ORDER = ["Starter Plan", "Pro Plan", "Growth Plan"] as const;

export type BillingPlanName = (typeof BILLING_PLAN_ORDER)[number];
