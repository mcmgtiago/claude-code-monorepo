export function SectionLabel({ index, children, light = false }: { index: string; children: string; light?: boolean }) {
  return <p className={`section-label ${light ? "section-label--light" : ""}`}><span>{index}</span>{children}</p>;
}
