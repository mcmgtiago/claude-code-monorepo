import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#0b0b0e] px-6 py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,138,116,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(244,194,123,0.14),transparent_30%)]" />
      <div className="absolute inset-x-0 top-[8%] text-center text-[28vw] font-semibold leading-none tracking-[-0.08em] text-white/[0.035] sm:text-[24vw]">
        404
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
        <div className="flex items-center gap-3 text-[var(--accent)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <Compass className="h-5 w-5" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em]">Error 404</p>
        </div>

        <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-white sm:text-7xl lg:text-[6.5rem] lg:leading-[0.92]">
          This page went for a snack and never came back.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-white/64 sm:text-lg">
          We looked behind the Kanban board, inside the client folder, and even under the office bean bag. Nothing.
        </p>

        <div className="mt-10 max-w-2xl">
          <div className="flex items-start gap-3 text-left">
            <Search className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" />
            <div>
              <p className="text-sm font-medium text-white">Possible causes</p>
              <p className="mt-2 text-sm leading-7 text-white/58 sm:text-[0.95rem]">
                bad link, typo, deleted route, or the page has decided to pursue a new career.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[var(--accent)]/22 bg-[linear-gradient(180deg,rgba(244,194,123,0.22)_0%,rgba(251,138,116,0.12)_100%)] px-5 text-sm font-semibold text-white transition hover:border-[var(--accent)]/36 hover:bg-[linear-gradient(180deg,rgba(244,194,123,0.28)_0%,rgba(251,138,116,0.16)_100%)]"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
