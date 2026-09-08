// Motor de e-mail do VeloHUB (Resend). Carregar só em handlers server-side.
const RESEND_URL = "https://api.resend.com/emails";

export type SendEmailOpts = {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  replyTo?: string;
};

/** Envia um e-mail via Resend. Não lança se a chave não estiver configurada (só avisa). */
export async function sendEmail(opts: SendEmailOpts): Promise<{ ok: boolean; skipped?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.warn("[email] RESEND_API_KEY ausente — pulando"); return { ok: false, skipped: true }; }
  if (!opts.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.to)) return { ok: false, skipped: true };

  const domain = process.env.QUOTE_FROM_DOMAIN;
  const name = (opts.fromName || "VeloHUB").replace(/[<>]/g, "").trim();
  const from = domain
    ? `${name} <orcamentos@${domain}>`
    : (process.env.QUOTE_FROM_EMAIL || "VeloHUB <onboarding@resend.dev>");

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html, ...(opts.replyTo ? { reply_to: opts.replyTo } : {}) }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend: ${err.slice(0, 200)}`);
  }
  return { ok: true };
}

/** Layout HTML branded para os e-mails. */
export function emailLayout(opts: { companyName: string; accent: string; title: string; intro?: string; bodyHtml?: string; ctaLabel?: string; ctaUrl?: string; footer?: string }): string {
  const { companyName, accent, title, intro, bodyHtml, ctaLabel, ctaUrl, footer } = opts;
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
      <div style="width:40px;height:40px;border-radius:10px;background:${accent};color:#04140b;display:flex;align-items:center;justify-content:center;font-weight:800">⚡</div>
      <div style="font-size:18px;font-weight:700">${companyName}</div>
    </div>
    <h1 style="font-size:20px;margin:0 0 8px">${title}</h1>
    ${intro ? `<p style="color:#666;margin:0 0 16px;line-height:1.6">${intro}</p>` : ""}
    ${bodyHtml ?? ""}
    ${ctaLabel && ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block;background:${accent};color:#04140b;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px;margin-top:8px">${ctaLabel}</a>` : ""}
    <p style="color:#999;font-size:12px;margin-top:28px">${footer ?? companyName}</p>
  </div>`;
}
