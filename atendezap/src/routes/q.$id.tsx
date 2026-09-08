import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { format, parseISO, addDays } from "date-fns";
import { brand } from "@/config/brand";
import { getPublicQuote } from "@/lib/quote-public.functions";
import { fmtMoney } from "@/config/money";
import { LANGS, DF, detectLang, type Lang } from "@/config/public-lang";
import { Loader2, FileText, Check, Clock, Zap } from "lucide-react";

export const Route = createFileRoute("/q/$id")({
  head: () => ({ meta: [{ title: `Orçamento — ${brand.name}` }] }),
  component: PublicQuote,
});

type Data = Awaited<ReturnType<typeof getPublicQuote>>;
const STATUS_COLOR: Record<string, string> = { draft: "#8aa89a", sent: "#3b82f6", accepted: "#0efa71", rejected: "#ef4444", expired: "#f59e0b" };

const T: Record<Lang, any> = {
  pt: { quote: "Orçamento", customer: "Cliente", subtotal: "Subtotal", discount: "Desconto", total: "Total", validUntil: "Válido até", accept: "Para aceitar, fale com", powered: "Desenvolvido por", dateFmt: "d 'de' MMMM, yyyy", validFmt: "d 'de' MMMM", status: { draft: "Rascunho", sent: "Enviado", accepted: "Aceito", rejected: "Recusado", expired: "Expirado" } },
  en: { quote: "Quote", customer: "Customer", subtotal: "Subtotal", discount: "Discount", total: "Total", validUntil: "Valid until", accept: "To accept, contact", powered: "Powered by", dateFmt: "MMMM d, yyyy", validFmt: "MMMM d", status: { draft: "Draft", sent: "Sent", accepted: "Accepted", rejected: "Declined", expired: "Expired" } },
  es: { quote: "Presupuesto", customer: "Cliente", subtotal: "Subtotal", discount: "Descuento", total: "Total", validUntil: "Válido hasta", accept: "Para aceptar, contacta a", powered: "Desarrollado por", dateFmt: "d 'de' MMMM, yyyy", validFmt: "d 'de' MMMM", status: { draft: "Borrador", sent: "Enviado", accepted: "Aceptado", rejected: "Rechazado", expired: "Expirado" } },
};

function PublicQuote() {
  const { id } = useParams({ from: "/q/$id" });
  const load = useServerFn(getPublicQuote);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>(() => detectLang());
  const t = T[lang];
  const dfLocale = DF[lang];

  useEffect(() => {
    load({ data: { id } }).then(setData).catch((e) => setError(e?.message || "Quote not found"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground p-6">
        <div className="text-center"><div className="text-4xl mb-3">🔍</div><h1 className="text-xl font-bold">{error}</h1></div>
      </div>
    );
  }
  if (!data) {
    return <div className="min-h-screen grid place-items-center bg-background text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>;
  }

  const { quote, company } = data;
  const accent = company.primaryColor;
  const usd = (n: number) => fmtMoney(n, (company as any).currency);
  const stColor = STATUS_COLOR[quote.status] ?? "#8aa89a";
  const stLabel = t.status[quote.status] ?? quote.status;
  const validUntil = addDays(parseISO(quote.createdAt), quote.validityDays);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        <header className="flex items-center gap-3 mb-6">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.nome} className="size-12 rounded-xl object-cover" />
          ) : (
            <div className="size-12 rounded-xl grid place-items-center text-[#04140b]" style={{ background: accent }}><Zap className="size-6" strokeWidth={2.5} /></div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-lg leading-tight truncate">{company.nome}</div>
            <div className="text-[12px] text-muted-foreground">{t.quote}</div>
          </div>
          <LangSwitch lang={lang} setLang={setLang} accent={accent} />
        </header>

        <div className="rounded-3xl border bg-[color:var(--panel,#fff)] shadow-sm overflow-hidden" style={{ borderColor: "var(--hairline,#e5e5e5)" }}>
          <div className="p-5 sm:p-6 border-b flex items-center justify-between gap-3" style={{ borderColor: "var(--hairline,#e5e5e5)" }}>
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: `${accent}1f`, color: accent }}><FileText className="size-5" /></div>
              <div>
                <div className="font-semibold">{quote.customerName || t.customer}</div>
                <div className="text-[12px] text-muted-foreground">{format(parseISO(quote.createdAt), t.dateFmt, { locale: dfLocale })}</div>
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: `${stColor}22`, color: stColor, border: `1px solid ${stColor}44` }}>{stLabel}</span>
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            {quote.items.map((it, i) => (
              <div key={i} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{it.qty}× {it.name}</span>
                <span className="font-medium whitespace-nowrap">{usd(it.total)}</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-1 space-y-1" style={{ borderColor: "var(--hairline,#e5e5e5)" }}>
              {quote.discount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-muted-foreground"><span>{t.subtotal}</span><span>{usd(quote.subtotal)}</span></div>
                  <div className="flex justify-between text-sm text-red-500"><span>{t.discount}</span><span>-{usd(quote.discount)}</span></div>
                </>
              )}
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold">{t.total}</span>
                <span className="font-bold text-2xl" style={{ color: accent }}>{usd(quote.total)}</span>
              </div>
            </div>

            {quote.notes && <p className="text-[13px] text-muted-foreground bg-[color:var(--panel-2,#f5f5f5)] rounded-xl p-3 mt-2">{quote.notes}</p>}

            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground pt-1">
              <Clock className="size-3.5" /> {t.validUntil} {format(validUntil, t.validFmt, { locale: dfLocale })}
            </div>
          </div>

          {company.telefone && (
            <div className="px-5 sm:px-6 py-4 border-t text-center" style={{ borderColor: "var(--hairline,#e5e5e5)" }}>
              <a href={`tel:${company.telefone}`} className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: accent }}>
                <Check className="size-4" /> {t.accept} {company.nome}: {company.telefone}
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-5">
          {t.powered} <a href="https://hub.velocitycompany.com.br" className="font-semibold hover:underline" style={{ color: accent }}>Velo</a>
        </p>
      </div>
    </div>
  );
}

export function LangSwitch({ lang, setLang, accent }: { lang: Lang; setLang: (l: Lang) => void; accent: string }) {
  return (
    <div className="flex gap-1 shrink-0">
      {LANGS.map((o) => (
        <button key={o.code} onClick={() => setLang(o.code)} title={o.code.toUpperCase()}
          className={`size-8 rounded-lg text-[15px] grid place-items-center transition ${lang === o.code ? "ring-1" : "opacity-50 hover:opacity-100"}`}
          style={lang === o.code ? { background: `${accent}1f` } : undefined}>
          {o.flag}
        </button>
      ))}
    </div>
  );
}
