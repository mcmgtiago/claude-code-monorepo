"use client";

import { useMemo, useState } from "react";
import { CircleMinus, CirclePlus, Search } from "lucide-react";

import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import { cn } from "@/lib/utils";

const FAQ_SURFACE_PATCH = "border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))]";

const faqs = [
  {
    id: "project-create",
    question: "How do I create a new project in the tool?",
    answer:
      'To create a new project, go to the dashboard and click on the "New Project" button. Fill in the required details, assign owners, and your project will be ready to go.',
  },
  {
    id: "invite-members",
    question: "Can I invite team members to collaborate on my project?",
    answer:
      "Yes. Open the project workspace, head to the members area, and invite teammates by role so they can access tasks, files, and discussions without extra setup.",
  },
  {
    id: "track-progress",
    question: "Is there a way to track task progress within the tool?",
    answer:
      "You can follow progress through board, list, and timeline views. Status changes, assignees, due dates, and completion markers all update the workspace in one place.",
  },
  {
    id: "notification-settings",
    question: "How can I customize the notifications I receive from the project management tool?",
    answer:
      "Use the alerts and settings area to control what gets surfaced, including task activity, assignment updates, reminders, and workflow-related account notifications.",
  },
  {
    id: "security",
    question: "What security measures are in place to protect my project data?",
    answer:
      "Planix is designed around authenticated workspaces, role-based access, controlled member permissions, and protected project surfaces to keep account data organized and secure.",
  },
] as const;

export function FaqShell() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string>(faqs[0].id);

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return faqs;
    }

    return faqs.filter(
      (item) =>
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <main className="bg-dashboard min-h-screen text-[var(--text-primary)] lg:h-screen lg:overflow-hidden lg:p-0">
      <div className="flex w-full flex-col lg:h-full lg:flex-row">
        <PrimarySidebar />

        <div className="flex flex-1 overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:border-l lg:border-white/6">
          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="shrink-0 border-b border-white/6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
              <h1 className="type-page-title tracking-tight text-white">FAQ&apos;s</h1>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              <section className={cn(FAQ_SURFACE_PATCH, "rounded-[var(--radius-xl)] px-5 py-5 shadow-[0_18px_36px_rgba(0,0,0,0.14)] sm:px-6 sm:py-6 lg:px-7 lg:py-7")}>
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--accent)]">Support</p>
                    <h2 className="mt-2 max-w-[720px] text-[2.25rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                      Top questions about Planix
                    </h2>
                  </div>

                  <p className="max-w-[320px] text-[15px] leading-6 text-[var(--text-muted)]">
                    Need something cleared up? Here are our most frequently asked questions.
                  </p>
                </div>

                <div className="mt-7 flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.025] px-4 py-4">
                  <Search className="h-4.5 w-4.5 text-[var(--text-muted)]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search"
                    className="w-full bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </section>

              <section className="mt-10 grid gap-10 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="max-w-[280px]">
                  <h3 className="text-[2rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)]">FAQs</h3>
                  <p className="mt-4 text-[15px] leading-7 text-[var(--text-muted)]">
                    Everything you need to know about the product and billing. Can&apos;t find the answer you&apos;re looking for? Please chat to our team.
                  </p>
                </div>

                <div className="space-y-4">
                  {filteredFaqs.map((item) => {
                    const open = openId === item.id;

                    return (
                      <article
                        key={item.id}
                        className={cn(
                          "rounded-[var(--radius-xl)] border transition-colors",
                          open
                            ? `${FAQ_SURFACE_PATCH} shadow-[0_18px_36px_rgba(0,0,0,0.12)]`
                            : "border-white/6 bg-white/[0.015] hover:border-white/10 hover:bg-white/[0.03]",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenId((current) => (current === item.id ? "" : item.id))}
                          className="flex w-full items-start justify-between gap-6 px-6 py-6 text-left"
                        >
                          <div className="min-w-0">
                            <h4
                              className={cn(
                                "text-[1.03rem] font-medium leading-7 transition-colors",
                                open ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
                              )}
                            >
                              {item.question}
                            </h4>
                            {open && (
                              <p className="mt-2 max-w-[720px] text-[14px] leading-7 text-[var(--text-secondary)]">
                                {item.answer}
                              </p>
                            )}
                          </div>

                          <span className="shrink-0 pt-0.5 text-[var(--text-muted)]">
                            {open ? <CircleMinus className="h-5 w-5" /> : <CirclePlus className="h-5 w-5" />}
                          </span>
                        </button>
                      </article>
                    );
                  })}

                  {filteredFaqs.length === 0 && (
                    <div className="rounded-[var(--radius-xl)] border border-dashed border-white/8 px-6 py-12 text-center text-[14px] text-[var(--text-muted)]">
                      No matching questions found.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
