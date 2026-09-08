export const ease = [0.22, 1, 0.36, 1] as const;

export function track(event: string, detail?: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent("eixo:analytics", { detail: { event, ...detail } }));
}
