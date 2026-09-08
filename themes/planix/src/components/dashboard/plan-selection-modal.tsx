"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Crown,
  Rocket,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { ModalCloseButton } from "@/components/ui/modal-close-button";
import type { BillingPlanCatalogItem, BillingPlanName, BillingUiConfig } from "@/lib/billing";
import { readJsonSafely } from "@/lib/settings-client";
import { defaultPlanSettings, type PlanSettings, type SettingsBundle } from "@/lib/settings";
import { cn } from "@/lib/utils";

type RazorpayCheckoutPayload = {
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

type RazorpayCheckoutOptions = {
  key: string;
  name: string;
  description: string;
  subscription_id: string;
  prefill?: {
    email?: string;
    name?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler?: (response: {
    razorpay_subscription_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
};

type RazorpayInstance = {
  open: () => void;
  on?: (event: "payment.failed", handler: (payload: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

const SALES_CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "hello@example.com";

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout is only available in the browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
      document.head.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

function formatPlanPrice(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function findBillingPlan(plans: BillingPlanCatalogItem[], planName: string) {
  return plans.find((plan) => plan.name === planName) ?? null;
}

function formatPlanLabel(planName: string) {
  return planName.replace(/\s+Plan$/, "");
}

function buildPlanFeatures(plan: BillingPlanCatalogItem) {
  return [
    `Up to ${plan.teamMembersLimit} team members`,
    `${plan.projectsLimit} active projects`,
    `${plan.storageLimitGb} GB storage`,
  ];
}

type PlanPresentation = {
  eyebrow?: string;
  audience: string;
  icon: LucideIcon;
  recommended?: boolean;
};

const PLAN_PRESENTATION: Record<BillingPlanName, PlanPresentation> = {
  "Starter Plan": {
    audience: "For solo operators and small teams.",
    icon: Rocket,
  },
  "Pro Plan": {
    audience: "For active teams running repeatable delivery.",
    icon: BriefcaseBusiness,
    recommended: true,
  },
  "Growth Plan": {
    audience: "For larger teams managing more client work.",
    icon: Crown,
  },
};

const ENTERPRISE_FEATURES = [
  "Custom onboarding support",
  "Security coordination",
  "Migration planning",
];

export function PlanSelectionModal({
  billing,
}: {
  billing: BillingUiConfig;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onboardingFlow = searchParams.get("onboarding") === "1" && searchParams.get("modal") === "plan";
  const [currentPlanName, setCurrentPlanName] = useState<string>("Starter Plan");
  const [selectedPlanName, setSelectedPlanName] = useState<string>("Starter Plan");
  const [currentPlan, setCurrentPlan] = useState<PlanSettings>(defaultPlanSettings);
  const [loading, setLoading] = useState(onboardingFlow);
  const [processingPlanName, setProcessingPlanName] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!onboardingFlow) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCurrentPlan() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        const payload = await readJsonSafely<{
          settings?: SettingsBundle;
          error?: string;
        }>(response);

        if (!response.ok || !payload?.settings) {
          throw new Error(payload?.error || "Unable to load billing details.");
        }

        if (cancelled) {
          return;
        }

        const activePlan = payload.settings.plan.name || "Starter Plan";
        setCurrentPlan(payload.settings.plan);
        setCurrentPlanName(activePlan);
        setSelectedPlanName(activePlan);
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Unable to load billing details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCurrentPlan();

    return () => {
      cancelled = true;
    };
  }, [onboardingFlow]);

  const selectedPlan = useMemo(
    () => findBillingPlan(billing.plans, selectedPlanName) ?? billing.plans[0] ?? null,
    [billing.plans, selectedPlanName],
  );

  function closeModal() {
    router.replace("/dashboard");
    router.refresh();
  }

  async function activateStarterPlan() {
    const starterPlan = findBillingPlan(billing.plans, "Starter Plan");

    if (!starterPlan) {
      throw new Error("Starter Plan is not available.");
    }

    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan: {
          name: starterPlan.name,
          priceMonthly: starterPlan.priceMonthly,
          renewsOn: "",
          teamMembersUsed: currentPlan.teamMembersUsed,
          teamMembersLimit: starterPlan.teamMembersLimit,
          projectsUsed: currentPlan.projectsUsed,
          projectsLimit: starterPlan.projectsLimit,
          storageUsedGb: currentPlan.storageUsedGb,
          storageLimitGb: starterPlan.storageLimitGb,
          billingHistory: currentPlan.billingHistory,
        },
      }),
    });
    const payload = await readJsonSafely<{
      settings?: SettingsBundle;
      error?: string;
    }>(response);

    if (!response.ok || !payload?.settings) {
      throw new Error(payload?.error || "Failed to activate Starter Plan.");
    }
  }

  async function startPaidPlanCheckout(planName: BillingPlanName) {
    if (!billing.razorpayEnabled) {
      throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET first.");
    }

    await loadRazorpayCheckoutScript();

    if (!window.Razorpay) {
      throw new Error("Razorpay checkout did not initialize.");
    }

    const orderResponse = await fetch("/api/settings/billing/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ planName }),
    });
    const orderPayload = await readJsonSafely<{
      checkout?: RazorpayCheckoutPayload;
      error?: string;
    }>(orderResponse);

    if (!orderResponse.ok || !orderPayload?.checkout) {
      throw new Error(orderPayload?.error || "Failed to create a billing order.");
    }

    const checkout = orderPayload.checkout;
    const RazorpayCtor = window.Razorpay;

    if (!RazorpayCtor) {
      throw new Error("Razorpay checkout did not initialize.");
    }

    await new Promise<void>((resolve, reject) => {
      let settled = false;

      function finish(callback: () => void) {
        if (settled) {
          return;
        }

        settled = true;
        callback();
      }

      const razorpay = new RazorpayCtor({
        key: checkout.keyId,
        name: "Planix",
        description: `Activate ${checkout.plan.name}`,
        subscription_id: checkout.subscription.id,
        prefill: {
          email: checkout.prefill.email || undefined,
          name: checkout.prefill.name || undefined,
          contact: checkout.prefill.contact || undefined,
        },
        notes: {
          plan_name: checkout.plan.name,
        },
        theme: {
          color: "#fb8a74",
        },
        modal: {
          ondismiss: () => finish(() => reject(new Error("Razorpay checkout was cancelled."))),
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/settings/billing/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                planName,
                ...response,
              }),
            });
            const verifyPayload = await readJsonSafely<{
              settings?: SettingsBundle;
              error?: string;
            }>(verifyResponse);

            if (!verifyResponse.ok || !verifyPayload?.settings) {
              throw new Error(verifyPayload?.error || "Payment verification failed.");
            }

            finish(resolve);
          } catch (nextError) {
            finish(() => reject(nextError instanceof Error ? nextError : new Error("Payment verification failed.")));
          }
        },
      });

      razorpay.on?.("payment.failed", (payload) => {
        finish(() => reject(new Error(payload.error?.description || "Payment failed.")));
      });

      razorpay.open();
    });
  }

  function getPlanButtonLabel(plan: BillingPlanCatalogItem, isCurrent: boolean) {
    if (isCurrent) {
      return "Current plan";
    }

    return plan.isPaid ? "Pay with Razorpay" : "Start free";
  }

  async function handlePlanAction(plan: BillingPlanCatalogItem | null) {
    if (!plan) {
      return;
    }

    setSelectedPlanName(plan.name);
    setProcessingPlanName(plan.name);
    setError("");

    try {
      if (plan.name === "Starter Plan") {
        await activateStarterPlan();
      } else if (plan.isPaid) {
        await startPaidPlanCheckout(plan.name);
      }

      closeModal();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to activate this plan.");
    } finally {
      setProcessingPlanName(null);
    }
  }

  if (!onboardingFlow) {
    return null;
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" />
      <div className="modal-surface modal-surface-scroll relative w-full max-w-[1140px] overflow-hidden border border-[#eadfd4] bg-[#f5efe8] p-3 text-[#1d2430] shadow-[0_40px_120px_rgba(25,20,16,0.28)] sm:p-4 lg:p-6 xl:p-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-18%] top-[-10%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(225,138,102,0.22),transparent_68%)] sm:left-[-10%] sm:top-[-12%] sm:h-[340px] sm:w-[340px]" />
          <div className="absolute right-[-14%] top-[6%] h-[210px] w-[210px] rounded-full bg-[radial-gradient(circle,rgba(86,109,129,0.18),transparent_70%)] sm:right-[-6%] sm:top-[8%] sm:h-[320px] sm:w-[320px]" />
          <div className="absolute bottom-[-10%] left-[18%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(216,181,133,0.18),transparent_72%)] sm:bottom-[-14%] sm:left-[28%] sm:h-[360px] sm:w-[360px]" />
        </div>

        <ModalCloseButton
          absolute
          onClick={closeModal}
          aria-label="Close plan selection"
          className="right-2 top-2 border-[#d8c8bb] bg-white/88 text-[#24303c] shadow-[0_10px_24px_rgba(56,38,28,0.08)] hover:border-[#bf7a65] hover:bg-white hover:text-[#b85e49] sm:right-4 sm:top-4"
        />

        <div className="relative">
          <div className="mx-auto max-w-[760px] text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d9c8bb] bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a5b48] shadow-[0_10px_30px_rgba(54,38,29,0.06)] backdrop-blur sm:gap-2 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.24em]">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Workspace plans
            </div>
            <h2 className="mt-3 text-[1.55rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[#18212c] sm:mt-4 sm:text-[2.15rem] lg:text-[2.85rem] xl:text-[3.15rem]">
              Pick the right plan for
              {" "}
              <span className="bg-gradient-to-r from-[#be654f] via-[#db8e66] to-[#627386] bg-clip-text text-transparent">
                how your team delivers
              </span>
            </h2>
            <p className="mx-auto mt-2.5 max-w-[680px] text-[13px] leading-5 text-[#5f6774] sm:mt-3 sm:text-[15px] sm:leading-6">
              Start free, upgrade when your team needs more room, or talk to us for enterprise rollout.
            </p>

          </div>

          {error ? (
            <div className="mx-auto mt-4 max-w-[760px] rounded-[18px] border border-[#d87a6e]/30 bg-[#fff1ee] px-4 py-3 text-[13px] text-[#a4493f] shadow-[0_18px_40px_rgba(130,57,46,0.08)] sm:mt-5 sm:rounded-[22px] sm:px-5 sm:text-sm">
              {error}
            </div>
          ) : null}

          <div className="mx-auto mt-5 grid max-w-[1060px] gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-3.5 xl:mt-7 2xl:grid-cols-4">
            {billing.plans.map((plan) => {
              const presentation = PLAN_PRESENTATION[plan.name];
              const features = buildPlanFeatures(plan);
              const isSelected = selectedPlanName === plan.name;
              const isCurrent = currentPlanName === plan.name;
              const isProcessing = processingPlanName === plan.name;
              const Icon = presentation.icon;

              return (
                <div
                  key={plan.name}
                  onClick={() => setSelectedPlanName(plan.name)}
                  className={cn(
                    "group relative flex min-h-[0] cursor-pointer flex-col overflow-hidden rounded-[20px] border p-3.5 transition-all duration-200 sm:rounded-[24px] sm:p-4",
                    isSelected
                      ? "border-[#ca745d] bg-white ring-2 ring-[#e2b2a3] shadow-[0_32px_90px_rgba(52,32,20,0.14),0_0_0_8px_rgba(226,178,163,0.18)]"
                      : "border-[#e6d9cd] bg-white/82 shadow-[0_22px_60px_rgba(54,39,30,0.08)] hover:-translate-y-1 hover:border-[#d8b09e] hover:shadow-[0_28px_75px_rgba(54,39,30,0.11)]",
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 opacity-100 transition-opacity",
                      plan.name === "Starter Plan" && "bg-[radial-gradient(circle_at_top_left,rgba(214,176,142,0.22),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(98,115,134,0.08),transparent_34%)]",
                      plan.name === "Pro Plan" && "bg-[radial-gradient(circle_at_top_right,rgba(190,101,79,0.20),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(219,142,102,0.18),transparent_34%)]",
                      plan.name === "Growth Plan" && "bg-[radial-gradient(circle_at_top_left,rgba(98,115,134,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(216,181,133,0.18),transparent_34%)]",
                    )}
                  />

                  <div className="relative flex h-full flex-col">
                    <div className={cn("flex gap-3", isCurrent ? "items-start justify-between" : "items-center justify-start")}>
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#eadfd3] bg-white/82 text-[#1c2630] shadow-[0_10px_20px_rgba(60,42,31,0.06)] sm:h-10 sm:w-10 sm:rounded-[18px]">
                        <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      </div>
                      {isCurrent ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          <span className="rounded-full border border-[#c9d7d1] bg-[#eff5f2] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#50725f] sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                            Current
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-2.5 sm:mt-3">
                      {presentation.eyebrow ? (
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a5b48] sm:text-[11px] sm:tracking-[0.22em]">
                          {presentation.eyebrow}
                        </p>
                      ) : null}
                      <h3 className={cn("text-[1.3rem] font-semibold tracking-[-0.04em] text-[#18212c] sm:text-[1.45rem]", presentation.eyebrow ? "mt-2" : "mt-0")}>
                        {formatPlanLabel(plan.name)}
                      </h3>
                      <p className="mt-1.5 text-[12.5px] leading-5 text-[#5f6774] sm:text-[13px] sm:leading-[1.35rem]">
                        {presentation.audience}
                      </p>
                    </div>

                    <div className="mt-3 rounded-[18px] border border-[#ece1d7] bg-white/84 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:mt-3.5 sm:rounded-[20px] sm:p-3.5">
                      <div className="flex items-end gap-2">
                        <span className="text-[1.7rem] font-semibold tracking-[-0.06em] text-[#18212c] sm:text-[1.85rem]">
                          {formatPlanPrice(plan.priceMonthly, plan.currency)}
                        </span>
                        <span className="pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d7581] sm:pb-2 sm:text-[12px] sm:tracking-[0.18em]">
                          / month
                        </span>
                      </div>
                    </div>

                    <ul className="mt-3 space-y-1.5 text-[12.5px] text-[#46505c] sm:mt-3.5 sm:space-y-2 sm:text-[13px]">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f2e7de] text-[#b85e49] sm:h-4.5 sm:w-4.5">
                            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-3 sm:pt-3.5">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handlePlanAction(plan);
                        }}
                        disabled={loading || Boolean(processingPlanName) || isCurrent}
                        className={cn(
                          "inline-flex w-full items-center justify-center gap-2 rounded-full px-3.5 py-2.5 text-[12.5px] font-semibold transition-colors sm:py-2.5 sm:text-[13px]",
                          isSelected
                            ? "bg-[#18212c] text-white"
                            : "border border-[#d9c8bc] bg-white text-[#1f2834] hover:border-[#bf7a65] hover:text-[#b85e49]",
                          (loading || Boolean(processingPlanName) || isCurrent) && "cursor-not-allowed opacity-60",
                        )}
                      >
                        {isProcessing ? "Processing..." : getPlanButtonLabel(plan, isCurrent)}
                        {!isProcessing ? <ArrowRight className="h-4 w-4" /> : null}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="relative flex min-h-[0] flex-col overflow-hidden rounded-[20px] border border-[#d9d1c7] bg-[#1b2430] p-3.5 text-white shadow-[0_32px_90px_rgba(21,25,30,0.22)] sm:rounded-[24px] sm:p-4">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,101,79,0.28),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(214,176,142,0.18),transparent_38%)]" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white sm:h-10 sm:w-10 sm:rounded-[18px]">
                    <ShieldCheck className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </div>
                  <span className="rounded-full border border-white/12 bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/80 sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                    Contact sales
                  </span>
                </div>

                <div className="mt-3 sm:mt-4">
                  <h3 className="text-[1.3rem] font-semibold tracking-[-0.04em] text-white sm:text-[1.45rem]">
                    Enterprise
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-5 text-white/72 sm:text-[13px] sm:leading-[1.35rem]">
                    For larger organizations that need rollout, security review, and migration support.
                  </p>
                </div>

                <ul className="mt-3.5 space-y-1.5 text-[12.5px] text-white/82 sm:mt-4 sm:space-y-2 sm:text-[13px]">
                  {ENTERPRISE_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/12 text-[#ffd0b7] sm:h-4.5 sm:w-4.5">
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-3.5 sm:pt-4">
                  <a
                    href={`mailto:${SALES_CONTACT_EMAIL}?subject=${encodeURIComponent("Enterprise Plan Inquiry")}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#fff7f1] px-3.5 py-2.5 text-[12.5px] font-semibold !text-[#111111] transition-colors hover:bg-[#f3e5da] hover:!text-[#111111] [&_svg]:text-[#111111] sm:py-2.5 sm:text-[13px]"
                  >
                    Talk to sales
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
