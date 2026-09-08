// Moeda configurável por empresa (company.currency). Padrão: USD.
export type CurrencyCode = "USD" | "EUR" | "BRL";

export const CURRENCIES: Record<CurrencyCode, { code: CurrencyCode; symbol: string; locale: string; label: string }> = {
  USD: { code: "USD", symbol: "$", locale: "en-US", label: "Dólar (US$)" },
  EUR: { code: "EUR", symbol: "€", locale: "de-DE", label: "Euro (€)" },
  BRL: { code: "BRL", symbol: "R$", locale: "pt-BR", label: "Real (R$)" },
};

export function currencyOf(c?: string | null): CurrencyCode {
  return c === "EUR" || c === "BRL" ? c : "USD";
}

/** Formata um valor na moeda da empresa. fmtMoney(1234.5, "EUR") → "1.234,50 €" */
export function fmtMoney(amount: number | string | null | undefined, currency?: string | null, opts?: { decimals?: number }): string {
  const cur = CURRENCIES[currencyOf(currency)];
  const n = Number(amount) || 0;
  const decimals = opts?.decimals ?? 2;
  try {
    return new Intl.NumberFormat(cur.locale, { style: "currency", currency: cur.code, minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
  } catch {
    return `${cur.symbol} ${n.toFixed(decimals)}`;
  }
}

export function moneySymbol(currency?: string | null): string {
  return CURRENCIES[currencyOf(currency)].symbol;
}
