"use client";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}

function HeaderSkeleton({
  title = "w-48",
  subtitle = "w-[min(34rem,80vw)]",
  actions = 0
}: {
  title?: string;
  subtitle?: string;
  actions?: number;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <SkeletonBlock className={`h-8 ${title}`} />
        <SkeletonBlock className={`mt-2 h-4 ${subtitle}`} />
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">
          {Array.from({ length: actions }).map((_, index) => (
            <SkeletonBlock key={index} className={index === actions - 1 ? "h-9 w-32" : "h-9 w-28"} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CardSkeleton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200/80 bg-white ${className}`}>{children}</div>;
}

function MetricCardGrid({ count = 4, columnsClassName = "sm:grid-cols-2 xl:grid-cols-4" }: { count?: number; columnsClassName?: string }) {
  return (
    <div className={`grid gap-4 ${columnsClassName}`}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="mt-4 h-8 w-20" />
              <SkeletonBlock className="mt-3 h-3 w-36" />
            </div>
            <SkeletonBlock className="h-11 w-11 rounded-2xl" />
          </div>
        </CardSkeleton>
      ))}
    </div>
  );
}

function ToolbarSkeleton({ left = 2, right = 1, search = true }: { left?: number; right?: number; search?: boolean }) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: left }).map((_, index) => (
          <SkeletonBlock key={index} className="h-9 w-28" />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {search ? <SkeletonBlock className="h-10 w-[min(22rem,70vw)]" /> : null}
        {Array.from({ length: right }).map((_, index) => (
          <SkeletonBlock key={index} className="h-9 w-28" />
        ))}
      </div>
    </div>
  );
}

function BareTableSkeleton({
  rows = 8,
  columns,
  rowHeight = "py-4"
}: {
  rows?: number;
  columns: string[];
  rowHeight?: string;
}) {
  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {columns.map((width, index) => (
                <th key={index} className="border-b border-r border-slate-200/80 px-3 py-3 last:border-r-0">
                  <SkeletonBlock className={`h-3 ${width}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((width, columnIndex) => (
                  <td key={columnIndex} className={`border-b border-r border-slate-200/80 px-3 ${rowHeight} last:border-r-0`}>
                    <SkeletonBlock className={`h-4 ${columnIndex === 0 ? "w-8" : width}`} />
                    {columnIndex === 1 ? <SkeletonBlock className="mt-2 h-3 w-28" /> : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
        <SkeletonBlock className="h-4 w-36" />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-8 w-8" />
          <SkeletonBlock className="h-8 w-8" />
          <SkeletonBlock className="h-8 w-20" />
        </div>
      </div>
    </>
  );
}

function TableSkeleton({
  rows = 8,
  columns,
  rowHeight = "py-4"
}: {
  rows?: number;
  columns: string[];
  rowHeight?: string;
}) {
  return (
    <CardSkeleton className="overflow-hidden p-0">
      <BareTableSkeleton rows={rows} columns={columns} rowHeight={rowHeight} />
    </CardSkeleton>
  );
}

function StackedRows({ rows, avatar = false }: { rows: number; avatar?: boolean }) {
  return (
    <div className="mt-5 space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-start gap-3">
          {avatar ? <SkeletonBlock className="h-10 w-10 shrink-0 rounded-2xl" /> : null}
          <div className="min-w-0 flex-1">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="mt-2 h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <HeaderSkeleton actions={4} />
      <MetricCardGrid />
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.68fr]">
        <CardSkeleton className="h-[360px] p-5">
          <div className="flex items-start justify-between">
            <div>
              <SkeletonBlock className="h-5 w-44" />
              <SkeletonBlock className="mt-2 h-3 w-60" />
            </div>
            <SkeletonBlock className="h-8 w-28" />
          </div>
          <SkeletonBlock className="mt-8 h-[250px] w-full" />
        </CardSkeleton>
        <CardSkeleton className="h-[360px] p-5">
          <div className="flex items-start justify-between">
            <div>
              <SkeletonBlock className="h-5 w-36" />
              <SkeletonBlock className="mt-2 h-3 w-44" />
            </div>
            <SkeletonBlock className="h-9 w-24" />
          </div>
          <div className="mt-8 space-y-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-3 w-12" />
                </div>
                <SkeletonBlock className="h-5 w-full" />
              </div>
            ))}
          </div>
        </CardSkeleton>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
        <TableSkeleton rows={6} columns={["w-6", "w-36", "w-28", "w-24", "w-20"]} />
        <CardSkeleton className="h-[440px] p-5">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="h-9 w-32" />
          </div>
          <StackedRows rows={7} avatar />
        </CardSkeleton>
      </div>
      <div className="mt-4">
        <MetricCardGrid count={4} columnsClassName="md:grid-cols-2 xl:grid-cols-4" />
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div>
      <HeaderSkeleton actions={0} />
      <MetricCardGrid count={8} />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <CardSkeleton key={index} className="h-[340px] p-5">
            <div className="flex items-start justify-between">
              <div>
                <SkeletonBlock className="h-5 w-44" />
                <SkeletonBlock className="mt-2 h-3 w-64" />
              </div>
              <SkeletonBlock className="h-8 w-28" />
            </div>
            <SkeletonBlock className="mt-8 h-[230px] w-full" />
          </CardSkeleton>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <CardSkeleton className="h-[320px] p-5">
          <SkeletonBlock className="h-5 w-48" />
          <SkeletonBlock className="mt-8 h-[230px] w-full" />
        </CardSkeleton>
        <CardSkeleton className="h-[320px] p-5">
          <SkeletonBlock className="h-5 w-44" />
          <div className="mt-8 grid grid-cols-[160px_minmax(0,1fr)] gap-6">
            <SkeletonBlock className="h-40 w-40 rounded-full" />
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <SkeletonBlock className="h-3 w-3 rounded-full" />
                  <SkeletonBlock className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        </CardSkeleton>
      </div>
    </div>
  );
}

function PipelineSkeleton() {
  return (
    <div>
      <HeaderSkeleton actions={0} />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBlock className="h-9 w-28" />
            <SkeletonBlock className="h-9 w-36" />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <SkeletonBlock className="h-8 w-40 rounded-full" />
            <SkeletonBlock className="h-8 w-36 rounded-full" />
            <SkeletonBlock className="h-8 w-28 rounded-full" />
            <SkeletonBlock className="h-9 w-24" />
            <SkeletonBlock className="h-9 w-28" />
          </div>
        </div>
        <div className="pipeline-board-scroll overflow-x-auto px-1 pb-3 pt-1">
          <div className="mb-4 grid min-w-max auto-cols-[minmax(250px,270px)] grid-flow-col items-start gap-3">
            {Array.from({ length: 6 }).map((_, columnIndex) => (
              <div key={columnIndex} className="flex min-w-[250px] flex-col rounded-2xl border border-slate-200/60 bg-slate-50 px-3 py-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-5 w-1 rounded-full" />
                    <SkeletonBlock className="h-4 w-24" />
                    <SkeletonBlock className="h-5 w-8 rounded-lg" />
                  </div>
                  <SkeletonBlock className="h-7 w-7" />
                </div>
                <div className="space-y-2.5">
                  {Array.from({ length: columnIndex % 2 === 0 ? 4 : 3 }).map((_, cardIndex) => (
                    <CardSkeleton key={cardIndex} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <SkeletonBlock className="h-4 w-32" />
                          <SkeletonBlock className="mt-2 h-3 w-24" />
                        </div>
                        <SkeletonBlock className="h-7 w-7 rounded-full" />
                      </div>
                      <SkeletonBlock className="mt-4 h-3 w-28" />
                      <SkeletonBlock className="mt-3 h-2 w-full" />
                    </CardSkeleton>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectoryTableSkeleton({ type }: { type: "companies" | "contacts" }) {
  const isCompanies = type === "companies";
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <SkeletonBlock className="h-8 w-44" />
          {isCompanies ? <SkeletonBlock className="mt-2 h-4 w-[min(36rem,82vw)]" /> : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonBlock className="h-9 w-24" />
          {!isCompanies ? <SkeletonBlock className="h-9 w-24" /> : null}
          <SkeletonBlock className="h-9 w-32" />
        </div>
      </div>
      <ToolbarSkeleton left={isCompanies ? 1 : 2} right={0} />
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-4 w-28" />
        {!isCompanies ? <SkeletonBlock className="h-4 w-36" /> : null}
      </div>
      <TableSkeleton
        rows={9}
        columns={
          isCompanies
            ? ["w-5", "w-36", "w-20", "w-28", "w-20", "w-28", "w-16", "w-24", "w-8"]
            : ["w-5", "w-36", "w-24", "w-32", "w-40", "w-28", "w-28", "w-8"]
        }
      />
    </div>
  );
}

function LeadsSkeleton() {
  return (
    <div>
      <HeaderSkeleton actions={1} />
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <CardSkeleton className="overflow-hidden p-0">
          <div className="border-b border-slate-200 bg-white px-5 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <SkeletonBlock className="h-5 w-44" />
                <SkeletonBlock className="mt-2 h-3 w-64" />
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <SkeletonBlock className="h-10 w-full sm:w-72" />
                <SkeletonBlock className="h-10 w-full sm:w-44" />
              </div>
            </div>
          </div>
          <div className="p-4">
            <BareTableSkeleton rows={8} columns={["w-36", "w-24", "w-20", "w-16", "w-24"]} />
          </div>
        </CardSkeleton>
        <div className="space-y-6">
          <CardSkeleton className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SkeletonBlock className="h-5 w-40" />
                <SkeletonBlock className="mt-2 h-4 w-36" />
              </div>
              <SkeletonBlock className="h-7 w-24 rounded-full" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <SkeletonBlock className="h-3 w-16" />
                  <SkeletonBlock className="mt-3 h-5 w-20" />
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index}>
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="mt-2 h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <CardSkeleton className="bg-slate-50 p-4">
                <SkeletonBlock className="h-4 w-24" />
                <StackedRows rows={3} />
              </CardSkeleton>
              <CardSkeleton className="bg-slate-50 p-4">
                <SkeletonBlock className="h-4 w-20" />
                <StackedRows rows={3} />
              </CardSkeleton>
            </div>
          </CardSkeleton>
        </div>
      </div>
    </div>
  );
}

function CompanyDetailSkeleton() {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-11 w-11 rounded-2xl" />
          <SkeletonBlock className="h-4 w-56" />
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-16 w-16 rounded-[20%]" />
            <div>
              <SkeletonBlock className="h-8 w-56" />
              <div className="mt-3 flex flex-wrap gap-5">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-32" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <SkeletonBlock className="h-9 w-28" />
            <SkeletonBlock className="h-9 w-32" />
          </div>
        </div>
      </div>
      <div className="mb-4 flex items-center gap-6 border-b border-slate-200">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="mb-4 h-5 w-24" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <CardSkeleton className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <SkeletonBlock className="h-5 w-40" />
            </div>
            <div className="space-y-5 px-5 py-5">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-10/12" />
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-[96px_1fr] gap-4">
                    <SkeletonBlock className="h-4 w-20" />
                    <SkeletonBlock className="h-4 w-32" />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <CardSkeleton className="bg-slate-50 p-4">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="mt-3 h-4 w-36" />
                </CardSkeleton>
                <CardSkeleton className="bg-slate-50 p-4">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="mt-3 h-4 w-36" />
                </CardSkeleton>
              </div>
            </div>
          </CardSkeleton>
          <TableSkeleton rows={5} columns={["w-36", "w-24", "w-28", "w-20"]} />
        </div>
        <div className="space-y-4">
          <MetricCardGrid count={3} columnsClassName="grid-cols-1" />
          <CardSkeleton className="p-5">
            <SkeletonBlock className="h-5 w-36" />
            <StackedRows rows={5} avatar />
          </CardSkeleton>
        </div>
      </div>
    </div>
  );
}

function ContactDetailSkeleton() {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-11 w-11 rounded-2xl" />
          <SkeletonBlock className="h-4 w-52" />
        </div>
        <div className="flex flex-wrap gap-3">
          <SkeletonBlock className="h-9 w-28" />
          <SkeletonBlock className="h-9 w-36" />
          <SkeletonBlock className="h-9 w-28" />
          <SkeletonBlock className="h-9 w-32" />
        </div>
      </div>
      <CardSkeleton className="overflow-hidden p-0">
        <div className="mx-3 mt-3 rounded-2xl border border-[#dbe5fb] bg-slate-50 px-5 py-5">
          <div className="flex items-start gap-4">
            <SkeletonBlock className="h-16 w-16 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SkeletonBlock className="h-8 w-56" />
                <SkeletonBlock className="h-7 w-20 rounded-full" />
                <SkeletonBlock className="h-7 w-28 rounded-full" />
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-4 w-36" />
                <SkeletonBlock className="h-4 w-24" />
              </div>
              <SkeletonBlock className="mt-4 h-4 w-[min(34rem,80vw)]" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-4 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-4">
            <CardSkeleton className="p-0">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <SkeletonBlock className="h-5 w-40" />
                <SkeletonBlock className="h-9 w-24" />
              </div>
              <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index}>
                    <SkeletonBlock className="h-3 w-24" />
                    <SkeletonBlock className="mt-2 h-5 w-40" />
                  </div>
                ))}
              </div>
            </CardSkeleton>
            <TableSkeleton rows={4} columns={["w-36", "w-24", "w-28", "w-20"]} />
          </div>
          <div className="space-y-4">
            <CardSkeleton className="p-5">
              <SkeletonBlock className="h-5 w-32" />
              <StackedRows rows={5} avatar />
            </CardSkeleton>
            <CardSkeleton className="p-5">
              <SkeletonBlock className="h-5 w-36" />
              <StackedRows rows={4} />
            </CardSkeleton>
          </div>
        </div>
      </CardSkeleton>
    </div>
  );
}

function TasksSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <HeaderSkeleton title="w-36" subtitle="w-72" actions={2} />
      <MetricCardGrid count={5} columnsClassName="grid-cols-1 sm:grid-cols-2 xl:grid-cols-5" />
      <div className="mt-3">
        <ToolbarSkeleton left={1} right={0} />
      </div>
      <TableSkeleton rows={8} columns={["w-5", "w-36", "w-32", "w-28", "w-24", "w-20", "w-28"]} />
    </div>
  );
}

function MeetingsSkeleton() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
        <SkeletonBlock className="h-8 w-36" />
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-9 w-28" />
        </div>
      </div>
      <div className="mb-4 flex items-center gap-8 border-b border-slate-200 px-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="mb-3 h-5 w-28" />
        ))}
      </div>
      <MetricCardGrid count={4} columnsClassName="md:grid-cols-2 xl:grid-cols-4" />
      <div className="mt-4">
        <ToolbarSkeleton left={2} right={2} />
      </div>
      <TableSkeleton rows={8} columns={["w-36", "w-28", "w-24", "w-24", "w-24", "w-28"]} rowHeight="py-4" />
    </div>
  );
}

function InboxSkeleton() {
  return (
    <div className="relative overflow-x-hidden">
      <HeaderSkeleton title="w-32" subtitle="w-[min(38rem,84vw)]" actions={1} />
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] xl:grid-cols-[220px_320px_minmax(0,1fr)]">
        <CardSkeleton className="h-fit p-4 lg:col-span-2 xl:col-span-1">
          <SkeletonBlock className="h-12 w-full" />
          <div className="mt-5">
            <SkeletonBlock className="h-3 w-24" />
            <div className="mt-3 flex gap-2 overflow-x-auto xl:block xl:space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-10 min-w-[128px] xl:w-full" />
              ))}
            </div>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-5">
            <SkeletonBlock className="h-3 w-24" />
            <div className="mt-3 grid gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <CardSkeleton key={index} className="p-3">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="mt-2 h-3 w-36" />
                </CardSkeleton>
              ))}
            </div>
          </div>
        </CardSkeleton>
        <CardSkeleton className="flex min-h-[640px] flex-col overflow-hidden p-0">
          <div className="border-b border-slate-200 px-5 py-5">
            <SkeletonBlock className="h-10 w-full" />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-2">
                <SkeletonBlock className="h-9 w-24" />
                <SkeletonBlock className="h-9 w-20" />
              </div>
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <SkeletonBlock className="h-4 w-3/4" />
                    <SkeletonBlock className="mt-2 h-3 w-1/2" />
                    <SkeletonBlock className="mt-3 h-3 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardSkeleton>
        <CardSkeleton className="min-h-[640px] p-0">
          <div className="border-b border-slate-200 px-6 py-5">
            <SkeletonBlock className="h-6 w-2/3" />
            <SkeletonBlock className="mt-3 h-4 w-44" />
          </div>
          <div className="p-6">
            <SkeletonBlock className="h-10 w-56" />
            <div className="mt-8 space-y-4">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-11/12" />
              <SkeletonBlock className="h-4 w-10/12" />
              <SkeletonBlock className="h-36 w-full" />
            </div>
          </div>
        </CardSkeleton>
      </div>
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div>
      <HeaderSkeleton title="w-24" subtitle="w-[min(42rem,80vw)]" actions={0} />
      <MetricCardGrid count={4} columnsClassName="md:grid-cols-4" />
      <CardSkeleton className="mt-4 overflow-hidden p-0">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="mt-2 h-4 w-72" />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SkeletonBlock className="h-10 w-32" />
              <SkeletonBlock className="h-10 w-80" />
            </div>
          </div>
        </div>
        <div className="px-5 py-5">
          <BareTableSkeleton rows={7} columns={["w-40", "w-44", "w-24", "w-24", "w-28", "w-28", "w-48"]} />
        </div>
      </CardSkeleton>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div>
      <HeaderSkeleton title="w-44" subtitle="w-[min(42rem,84vw)]" actions={0} />
      <div className="grid items-start gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <CardSkeleton className="p-5">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <SkeletonBlock className="h-11 w-11 rounded-2xl" />
                <div>
                  <SkeletonBlock className="h-5 w-44" />
                  <SkeletonBlock className="mt-2 h-4 w-72" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock className="h-9 w-32" />
                <SkeletonBlock className="h-9 w-28" />
              </div>
            </div>
            <SkeletonBlock className="mt-4 h-9 w-48" />
          </div>
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <CardSkeleton key={index} className="p-4">
                <div className="flex gap-3">
                  <SkeletonBlock className="h-11 w-11 shrink-0 rounded-2xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <SkeletonBlock className="h-5 w-2/3" />
                        <SkeletonBlock className="mt-2 h-4 w-full" />
                      </div>
                      <div className="flex gap-2">
                        <SkeletonBlock className="h-9 w-20" />
                        <SkeletonBlock className="h-9 w-24" />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <SkeletonBlock className="h-7 w-36" />
                      <SkeletonBlock className="h-7 w-28" />
                    </div>
                  </div>
                </div>
              </CardSkeleton>
            ))}
          </div>
        </CardSkeleton>
        <div className="space-y-4">
          <CardSkeleton className="p-5">
            <SkeletonBlock className="h-5 w-44" />
            <SkeletonBlock className="mt-2 h-4 w-56" />
            <div className="mt-4 grid gap-2.5 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <CardSkeleton key={index} className="p-4">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="mt-3 h-8 w-14" />
                  <SkeletonBlock className="mt-3 h-3 w-24" />
                </CardSkeleton>
              ))}
            </div>
          </CardSkeleton>
          <CardSkeleton className="p-5">
            <SkeletonBlock className="h-5 w-40" />
            <StackedRows rows={3} avatar />
          </CardSkeleton>
          <CardSkeleton className="p-5">
            <SkeletonBlock className="h-5 w-36" />
            <StackedRows rows={5} avatar />
          </CardSkeleton>
        </div>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton title="w-32" subtitle="w-[min(42rem,84vw)]" actions={1} />
      <div className="grid gap-6 lg:items-start lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside>
          <CardSkeleton className="p-2.5">
            <div className="space-y-1">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2.5 rounded-xl border border-transparent px-3 py-2">
                  <SkeletonBlock className="h-8 w-8 rounded-xl" />
                  <SkeletonBlock className="h-4 w-28" />
                  {index % 3 === 0 ? <SkeletonBlock className="ml-auto h-5 w-7 rounded-full" /> : null}
                </div>
              ))}
            </div>
          </CardSkeleton>
        </aside>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-8 py-6">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="mt-3 h-9 w-56" />
          </div>
          <div className="px-8 py-6">
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index}>
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="mt-2 h-11 w-full" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <SkeletonBlock className="h-10 w-24" />
              <SkeletonBlock className="h-10 w-32" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SuperuserSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-88px)] gap-6">
      <aside className="hidden w-52 shrink-0 lg:block">
        <CardSkeleton className="sticky top-6 overflow-hidden p-0">
          <div className="border-b border-slate-100 px-4 py-3">
            <SkeletonBlock className="h-3 w-28" />
          </div>
          <nav className="space-y-1 p-2.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl px-3 py-3.5">
                <SkeletonBlock className="h-4 w-4" />
                <div className="flex-1">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="mt-2 h-3 w-16" />
                </div>
              </div>
            ))}
          </nav>
        </CardSkeleton>
      </aside>
      <div className="min-w-0 flex-1 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <SkeletonBlock className="h-6 w-28" />
            <SkeletonBlock className="mt-2 h-4 w-56" />
          </div>
          <SkeletonBlock className="h-7 w-16 rounded-full" />
        </div>
        <MetricCardGrid count={4} />
        <CardSkeleton className="p-0">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <SkeletonBlock className="h-4 w-28" />
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-12 w-full" />
            ))}
          </div>
        </CardSkeleton>
        <CardSkeleton className="p-5">
          <SkeletonBlock className="h-5 w-40" />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-11 w-full" />
            ))}
          </div>
        </CardSkeleton>
      </div>
    </div>
  );
}

function AuthPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f6f9ff] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <CardSkeleton className="grid w-full max-w-5xl overflow-hidden p-0 lg:grid-cols-[1fr_0.92fr]">
          <div className="hidden min-h-[560px] bg-slate-50 p-8 lg:block">
            <SkeletonBlock className="h-10 w-40" />
            <SkeletonBlock className="mt-10 h-8 w-72" />
            <SkeletonBlock className="mt-3 h-4 w-96" />
            <div className="mt-10 grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} className="h-32 p-4">
                  <SkeletonBlock className="h-4 w-20" />
                  <SkeletonBlock className="mt-6 h-5 w-16" />
                </CardSkeleton>
              ))}
            </div>
          </div>
          <div className="px-8 py-10 sm:px-12">
            <SkeletonBlock className="h-10 w-40" />
            <SkeletonBlock className="mt-10 h-9 w-56" />
            <SkeletonBlock className="mt-3 h-4 w-64" />
            <div className="mt-8 space-y-4">
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-11 w-full" />
            </div>
          </div>
        </CardSkeleton>
      </div>
    </main>
  );
}

function OnboardingSkeleton() {
  return (
    <main className="min-h-screen bg-[#f6f9ff] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-10 w-44" />
          <SkeletonBlock className="h-8 w-28 rounded-full" />
        </div>
        <CardSkeleton className="mt-8 overflow-hidden p-0">
          <div className="border-b border-slate-200 px-6 py-5">
            <SkeletonBlock className="h-8 w-72" />
            <SkeletonBlock className="mt-3 h-4 w-[min(36rem,80vw)]" />
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-11 w-full" />
              ))}
            </div>
            <div>
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index}>
                    <SkeletonBlock className="h-4 w-28" />
                    <SkeletonBlock className="mt-2 h-11 w-full" />
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <SkeletonBlock className="h-10 w-24" />
                <SkeletonBlock className="h-10 w-36" />
              </div>
            </div>
          </div>
        </CardSkeleton>
      </div>
    </main>
  );
}

function BlockedSkeleton() {
  return (
    <main className="min-h-screen bg-[#fff7f5] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <CardSkeleton className="w-full overflow-hidden p-0">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="border-b border-red-100 bg-white p-8 lg:border-b-0 lg:border-r">
              <SkeletonBlock className="h-8 w-40 rounded-full" />
              <SkeletonBlock className="mt-6 h-12 w-3/4" />
              <SkeletonBlock className="mt-5 h-4 w-full" />
              <SkeletonBlock className="mt-3 h-4 w-11/12" />
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <CardSkeleton className="p-5">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="mt-3 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-10/12" />
                </CardSkeleton>
                <CardSkeleton className="p-5">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="mt-3 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-10/12" />
                </CardSkeleton>
              </div>
            </div>
            <div className="bg-slate-950 p-8">
              <SkeletonBlock className="h-16 w-16 rounded-3xl bg-slate-700" />
              <SkeletonBlock className="mt-8 h-3 w-36 bg-slate-700" />
              <SkeletonBlock className="mt-4 h-9 w-40 bg-slate-700" />
              <SkeletonBlock className="mt-5 h-4 w-full bg-slate-700" />
              <SkeletonBlock className="mt-20 h-12 w-full bg-slate-700" />
            </div>
          </div>
        </CardSkeleton>
      </div>
    </main>
  );
}

function PublicMeetingSkeleton() {
  return (
    <main className="min-h-screen bg-[#f6f9ff] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <SkeletonBlock className="h-10 w-44" />
          <SkeletonBlock className="h-9 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
          <CardSkeleton className="p-6">
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonBlock className="mt-4 h-4 w-full" />
            <SkeletonBlock className="mt-3 h-4 w-10/12" />
            <div className="mt-8 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <CardSkeleton key={index} className="p-4">
                  <SkeletonBlock className="h-5 w-40" />
                  <SkeletonBlock className="mt-2 h-4 w-52" />
                </CardSkeleton>
              ))}
            </div>
          </CardSkeleton>
          <CardSkeleton className="p-6">
            <SkeletonBlock className="h-6 w-48" />
            <div className="mt-6 grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-14 w-full" />
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-11 w-full" />
            </div>
          </CardSkeleton>
        </div>
      </div>
    </main>
  );
}

export function RouteSkeleton({ routeKey }: { routeKey: string }) {
  switch (routeKey) {
    case "/": return <DashboardSkeleton />;
    case "/analytics": return <AnalyticsSkeleton />;
    case "/pipeline": return <PipelineSkeleton />;
    case "/companies": return <DirectoryTableSkeleton type="companies" />;
    case "/companies/detail": return <CompanyDetailSkeleton />;
    case "/contacts": return <DirectoryTableSkeleton type="contacts" />;
    case "/contacts/detail": return <ContactDetailSkeleton />;
    case "/leads": return <LeadsSkeleton />;
    case "/tasks": return <TasksSkeleton />;
    case "/meetings": return <MeetingsSkeleton />;
    case "/inbox": return <InboxSkeleton />;
    case "/team": return <TeamSkeleton />;
    case "/notifications": return <NotificationsSkeleton />;
    case "/settings": return <SettingsSkeleton />;
    case "/superuser": return <SuperuserSkeleton />;
    case "/login":
    case "/signup":
    case "/forgot-password":
    case "/reset-password": return <AuthPageSkeleton />;
    case "/onboarding": return <OnboardingSkeleton />;
    case "/blocked": return <BlockedSkeleton />;
    case "/meet": return <PublicMeetingSkeleton />;
    default: return <DirectoryTableSkeleton type="contacts" />;
  }
}
