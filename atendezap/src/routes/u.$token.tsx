import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { brand } from "@/config/brand";
import { unsubscribeReactivation } from "@/lib/reactivation-public.functions";
import { Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/u/$token")({
  head: () => ({ meta: [{ title: `Unsubscribe — ${brand.name}` }] }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = useParams({ from: "/u/$token" });
  const run = useServerFn(unsubscribeReactivation);
  const [state, setState] = useState<{ ok: boolean; accent: string; nome: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    run({ data: { token } })
      .then((r: any) => setState({ ok: true, accent: r.company.accent, nome: r.company.nome }))
      .catch((e) => setError(e?.message || "Invalid link"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground px-4">
      <div className="text-center max-w-sm">
        {error ? (
          <><div className="text-4xl mb-3">🔗</div><h1 className="text-xl font-bold">{error}</h1></>
        ) : !state ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground mx-auto" />
        ) : (
          <>
            <CheckCircle2 className="size-12 mx-auto mb-3" style={{ color: state.accent }} />
            <h1 className="text-xl font-bold">You're unsubscribed</h1>
            <p className="text-sm text-muted-foreground mt-2">You won't receive more reactivation emails from {state.nome}. Changed your mind? Just reply to any previous email.</p>
          </>
        )}
      </div>
    </div>
  );
}
