/**
 * Utilitário para concatenar classes condicionalmente.
 * Inspirado no `clsx` para manter o bundle pequeno.
 */
export function cn(
  ...classes: Array<string | undefined | null | false>
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formata número em moeda BRL.
 */
export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}