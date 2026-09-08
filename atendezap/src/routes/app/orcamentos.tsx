import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Send, Trash2, FileText, Check, X, DollarSign, Mail, Link as LinkIcon } from "lucide-react";
import { buildQuoteText } from "@/lib/quote.functions";
import type { Quote, QuoteItem } from "@/lib/quote.functions";
import { sendQuoteEmail, sendQuoteAcceptedEmail } from "@/lib/email.functions";
import { useServerFn } from "@tanstack/react-start";
import { fmtMoney, currencyOf } from "@/config/money";

export const Route = createFileRoute("/app/orcamentos")({
  head: () => ({ meta: [{ title: `${brand.name} — Orçamentos` }] }),
  component: OrcamentosPage,
});

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "#8aa89a" },
  sent: { label: "Enviado", color: "#3b82f6" },
  accepted: { label: "Aceito", color: "#0efa71" },
  rejected: { label: "Recusado", color: "#ef4444" },
  expired: { label: "Expirado", color: "#f59e0b" },
};

const EMPTY_ITEM: QuoteItem = { name: "", qty: 1, unit_price: 0, total: 0 };

function OrcamentosPage() {
  const ctx = Route.useRouteContext();
  const companyId = ctx.company?.id ?? "";
  const sendEmailFn = useServerFn(sendQuoteEmail);
  const acceptedEmailFn = useServerFn(sendQuoteAcceptedEmail);
  const currency = currencyOf((ctx.company as any)?.currency);

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [saving, setSaving] = useState(false);
  const companyName = ctx.company?.nome ?? "VeloHUB";

  const [form, setForm] = useState({
    customerName: "", customerPhone: "", notes: "", discount: "0", validityDays: 7,
    items: [{ ...EMPTY_ITEM }] as QuoteItem[],
  });

  async function load() {
    if (!companyId) return;
    const { data } = await (supabase as any).from("quote").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    setQuotes((data ?? []) as Quote[]);
  }

  useEffect(() => { load(); }, [companyId]);

  function updateItem(idx: number, field: keyof QuoteItem, val: string | number) {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: val } as QuoteItem;
      if (field === "qty" || field === "unit_price") {
        items[idx].total = items[idx].qty * items[idx].unit_price;
      }
      return { ...f, items };
    });
  }

  const subtotal = form.items.reduce((s, i) => s + i.total, 0);
  const discount = parseFloat(form.discount) || 0;
  const total = subtotal - discount;

  async function save() {
    const validItems = form.items.filter(i => i.name && i.total > 0);
    if (!validItems.length) return toast.error("Adicione pelo menos um item");
    setSaving(true);
    try {
      await (supabase as any).from("quote").insert({
        company_id: companyId,
        customer_name: form.customerName || null,
        customer_phone: form.customerPhone || null,
        items: validItems,
        subtotal,
        discount,
        total_amount: total,
        notes: form.notes || null,
        validity_days: form.validityDays,
        status: "draft",
      });
      toast.success("Orçamento criado");
      setOpen(false);
      setForm({ customerName: "", customerPhone: "", notes: "", discount: "0", validityDays: 7, items: [{ ...EMPTY_ITEM }] });
      load();
    } finally { setSaving(false); }
  }

  function quoteLink(quote: Quote) {
    return `${typeof window !== "undefined" ? window.location.origin : ""}/q/${quote.id}`;
  }

  function markSent(quote: Quote) {
    (supabase as any).from("quote").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", quote.id).then(() => load());
  }

  function sendWhatsApp(quote: Quote) {
    const text = `${buildQuoteText(quote, companyName, currency)}\n\n🔗 ${quoteLink(quote)}`;
    const phone = (quote.customer_phone || "").replace(/\D/g, "");
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    markSent(quote);
  }

  function copyLink(quote: Quote) {
    navigator.clipboard.writeText(quoteLink(quote))
      .then(() => { toast.success("Link copiado! Cole no Instagram, Messenger, e-mail…"); markSent(quote); })
      .catch(() => toast.message("Link do orçamento", { description: quoteLink(quote) }));
  }

  function emailFallback(quote: Quote, to?: string) {
    const subject = `Orçamento — ${companyName}`;
    const body = `${buildQuoteText(quote, companyName, currency)}\n\n${quoteLink(quote)}`;
    window.location.href = `mailto:${to ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    markSent(quote);
  }

  async function sendEmail(quote: Quote) {
    const to = window.prompt("E-mail do cliente para enviar o orçamento:");
    if (to === null) return; // cancelou
    const email = to.trim();
    if (!email) return emailFallback(quote);
    try {
      await sendEmailFn({ data: { quoteId: quote.id, toEmail: email } });
      toast.success("Orçamento enviado por e-mail!");
      load();
    } catch (e: any) {
      // Sem domínio verificado no Resend ainda → abre o e-mail do usuário
      toast.message("Abrindo seu e-mail…", { description: e?.message?.slice(0, 120) || "Envio automático indisponível" });
      emailFallback(quote, email);
    }
  }

  async function updateStatus(id: string, status: string) {
    await (supabase as any).from("quote").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    toast.success("Status atualizado");
    // Ao aprovar, confirma para o cliente final por e-mail (se houver e-mail no orçamento)
    if (status === "accepted") {
      acceptedEmailFn({ data: { quoteId: id } }).catch(() => {});
    }
    load();
    setSelected(null);
  }

  async function del(id: string) {
    await (supabase as any).from("quote").delete().eq("id", id);
    toast.success("Orçamento removido");
    load();
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Orçamentos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Crie e envie orçamentos pelo WhatsApp</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4 mr-1" />Novo orçamento</Button>
      </div>

      {quotes.length === 0 ? (
        <div className="panel p-12 text-center">
          <FileText className="size-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">Nenhum orçamento ainda</p>
          <p className="text-sm text-muted-foreground mt-1">Crie orçamentos profissionais e envie direto pelo WhatsApp</p>
          <Button size="sm" className="mt-4" onClick={() => setOpen(true)}><Plus className="size-4 mr-1" />Criar primeiro orçamento</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {quotes.map(q => {
            const st = STATUS_MAP[q.status] ?? { label: q.status, color: "#8aa89a" };
            return (
              <div key={q.id} className="panel p-4 flex items-center gap-3 cursor-pointer hover:bg-[color:var(--panel-2)] transition-colors" onClick={() => setSelected(q)}>
                <div className="size-10 rounded-xl bg-[color:var(--brand-soft)] grid place-items-center text-[color:var(--brand-text)] shrink-0">
                  <FileText className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px] truncate">{q.customer_name || "Sem nome"}</span>
                    <Badge style={{ background: st.color + "22", color: st.color, border: `1px solid ${st.color}44` }} className="text-[10px] shrink-0">{st.label}</Badge>
                  </div>
                  <div className="text-[12px] text-muted-foreground">{q.customer_phone} · {format(new Date(q.created_at), "d MMM yyyy", { locale: ptBR })}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[15px]">{fmtMoney(q.total_amount ?? 0, currency)}</div>
                  <div className="text-[11px] text-muted-foreground">{(Array.isArray(q.items) ? q.items : []).length} item(s)</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1" />
          <div className="w-full max-w-sm bg-[color:var(--panel)] border-l border-[color:var(--hairline)] p-5 overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Orçamento</h2>
              <button onClick={() => setSelected(null)}><X className="size-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-1 mb-4">
              {selected.customer_name && <div className="font-semibold">{selected.customer_name}</div>}
              {selected.customer_phone && <div className="text-sm text-muted-foreground">{selected.customer_phone}</div>}
            </div>
            <div className="space-y-1 bg-[color:var(--panel-2)] rounded-xl p-3 mb-4">
              {(Array.isArray(selected.items) ? selected.items : []).map((item, i) => {
                const qty = Number(item?.qty ?? 1);
                const unit = Number((item as any)?.unit_price ?? (item as any)?.price ?? 0);
                const tot = Number(item?.total ?? qty * unit);
                return (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{qty}x {item?.name}</span>
                    <span className="font-medium">{fmtMoney(tot, currency)}</span>
                  </div>
                );
              })}
              <div className="border-t border-[color:var(--hairline)] mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-[color:var(--brand-text)]">{fmtMoney(selected.total_amount ?? 0, currency)}</span>
              </div>
            </div>
            {selected.notes && <p className="text-sm text-muted-foreground mb-4">{selected.notes}</p>}
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Enviar orçamento</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => sendWhatsApp(selected)} className="flex-col h-auto py-2.5 gap-1">
                    <Send className="size-4" /><span className="text-[11px]">WhatsApp</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => sendEmail(selected)} className="flex-col h-auto py-2.5 gap-1">
                    <Mail className="size-4" /><span className="text-[11px]">E-mail</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyLink(selected)} className="flex-col h-auto py-2.5 gap-1">
                    <LinkIcon className="size-4" /><span className="text-[11px]">Copiar link</span>
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">O link abre uma página do orçamento — cole no Instagram, Messenger ou onde quiser.</p>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => updateStatus(selected.id, "accepted")}><Check className="size-4 mr-1" />Aceito</Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => updateStatus(selected.id, "rejected")}><X className="size-4 mr-1" />Recusado</Button>
              </div>
              <Button variant="destructive" size="sm" className="w-full" onClick={() => del(selected.id)}><Trash2 className="size-4 mr-1" />Remover</Button>
            </div>
          </div>
        </div>
      )}

      {/* New quote dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Orçamento</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Nome do cliente</Label><Input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="João Silva" /></div>
              <div className="space-y-1.5"><Label>WhatsApp</Label><Input value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="+1 555..." /></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Itens do orçamento</Label>
                <button onClick={() => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }))} className="text-xs text-[color:var(--brand-text)] font-medium flex items-center gap-1 hover:underline">
                  <Plus className="size-3" />Adicionar item
                </button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_60px_80px_80px_28px] gap-1.5 items-start">
                    <Input value={item.name} onChange={e => updateItem(idx, "name", e.target.value)} placeholder="Descrição do serviço" />
                    <Input type="number" value={item.qty} onChange={e => updateItem(idx, "qty", parseFloat(e.target.value) || 1)} className="text-center" min={1} />
                    <Input type="number" step="0.01" value={item.unit_price || ""} onChange={e => updateItem(idx, "unit_price", parseFloat(e.target.value) || 0)} placeholder="0.00" />
                    <div className="h-9 flex items-center justify-center text-sm font-medium text-[color:var(--brand-text)]">{fmtMoney(item.total, currency)}</div>
                    {form.items.length > 1 && <button onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))} className="size-7 grid place-items-center text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>}
                  </div>
                ))}
                <div className="text-xs text-muted-foreground pl-1 grid grid-cols-[1fr_60px_80px_80px_28px] gap-1.5">
                  <span>Descrição</span><span className="text-center">Qtd</span><span>Preço unit.</span><span className="text-center">Total</span><span />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Desconto ($)</Label><Input type="number" step="0.01" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Validade (dias)</Label><Input type="number" value={form.validityDays} onChange={e => setForm(f => ({ ...f, validityDays: parseInt(e.target.value) || 7 }))} /></div>
            </div>
            <div className="space-y-1.5"><Label>Observações</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Condições, material incluso, etc..." /></div>

            <div className="bg-[color:var(--panel-2)] rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmtMoney(subtotal, currency)}</span></div>
              {discount > 0 && <div className="flex justify-between text-red-500"><span>Desconto</span><span>-{fmtMoney(discount, currency)}</span></div>}
              <div className="flex justify-between font-bold text-[15px] pt-1 border-t border-[color:var(--hairline)]"><span>Total</span><span className="text-[color:var(--brand-text)]">{fmtMoney(total, currency)}</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Criar orçamento"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
