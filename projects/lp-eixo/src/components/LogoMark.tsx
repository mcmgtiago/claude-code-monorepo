export function LogoMark({ light = false }: { light?: boolean }) {
  const color = light ? "currentColor" : "var(--ink)";
  return <span className="logo" aria-label="EIXO"><svg width="28" height="28" viewBox="0 0 28 28" role="img" aria-hidden="true"><path d="M14 2v7M14 19v7M2 14h7M19 14h7" stroke={color} strokeWidth="2" strokeLinecap="round"/><circle cx="14" cy="14" r="3" fill="var(--signal)"/></svg><strong>EIXO</strong><small>PEOPLE &amp; ORGANIZATION</small></span>;
}
