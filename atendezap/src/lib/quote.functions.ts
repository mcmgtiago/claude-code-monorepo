import { fmtMoney } from "@/config/money";

export type QuoteItem = {
  name: string;
  qty: number;
  unit_price: number;
  total: number;
  notes?: string;
};

export type Quote = {
  id: string;
  company_id: string;
  card_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total_amount: number;
  notes: string | null;
  validity_days: number;
  status: string;
  sent_at: string | null;
  accepted_at: string | null;
  created_at: string;
};

export function buildQuoteText(quote: Quote, companyName: string, currency?: string): string {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + (quote.validity_days ?? 7));
  const expiryStr = expiry.toLocaleDateString("en-US");
  const m = (n: number) => fmtMoney(n, currency);

  const itemLines = (Array.isArray(quote.items) ? quote.items : [])
    .map((i: any) => {
      const qty = Number(i?.qty ?? 1);
      const unit = Number(i?.unit_price ?? i?.price ?? 0);
      const total = Number(i?.total ?? qty * unit);
      return `  • ${i?.name ?? ""} (${qty}x) — ${m(unit)} = *${m(total)}*${i?.notes ? `\n    ↳ ${i.notes}` : ""}`;
    })
    .join("\n");

  return [
    `📋 *QUOTE — ${companyName}*`,
    ``,
    itemLines,
    ``,
    quote.discount > 0 ? `Subtotal: ${m(quote.subtotal)}\nDiscount: -${m(quote.discount)}` : null,
    `*Total: ${m(quote.total_amount)}*`,
    ``,
    quote.notes ? `📝 ${quote.notes}` : null,
    ``,
    `⏳ Valid until ${expiryStr}`,
    ``,
    `To accept this quote reply *YES*.`,
  ].filter(Boolean).join("\n");
}

export function openQuoteWhatsapp(phone: string, text: string) {
  const cleaned = phone.replace(/\D/g, "");
  const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
