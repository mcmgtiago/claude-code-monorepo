import { motion, useReducedMotion } from "motion/react";

const nodes = [
  { x: 310, y: 116, label: "ESTRATÉGIA", tension: false },
  { x: 492, y: 238, label: "LIDERANÇA", tension: false },
  { x: 444, y: 450, label: "OPERAÇÃO", tension: false },
  { x: 176, y: 456, label: "CULTURA", tension: true },
  { x: 126, y: 238, label: "TALENTOS", tension: false },
];

export function SignalMap() {
  const reduce = useReducedMotion();
  return <div className="signal-map" data-od-id="organizational-signal-map">
    <div className="signal-head"><span>ORGANIZATIONAL SIGNAL MAP</span><span>LIVE / BASELINE</span></div>
    <div className="signal-chip">5 sinais mapeados</div>
    <svg viewBox="0 0 620 620" role="img" aria-label="Mapa de sinais conectando estratégia, liderança, operação, cultura e talentos">
      {[100, 180, 260].map((r) => <circle key={r} cx="310" cy="310" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1" />)}
      <path d="M310 50V570M50 310H570M126 238L492 382M492 238L176 456" stroke="rgba(255,255,255,.07)" />
      {nodes.map((node) => <g key={node.label}><line x1="310" y1="310" x2={node.x} y2={node.y} className="signal-line" stroke="rgba(199,243,106,.55)" strokeWidth="1.5"/><circle cx={node.x} cy={node.y} r="26" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.18)"/><circle cx={node.x} cy={node.y} r="5" fill={node.tension ? "var(--clay)" : "var(--signal)"}/><text x={node.x} y={node.y + 45} textAnchor="middle">{node.label}</text></g>)}
      <circle cx="310" cy="310" r="48" fill="#171a17" stroke="rgba(199,243,106,.6)"/><circle cx="310" cy="310" r="8" fill="var(--signal)"/><text x="310" y="377" textAnchor="middle">NÚCLEO EIXO</text>
      {[{x:260,y:230},{x:382,y:278},{x:360,y:390},{x:238,y:364}].map((n,i)=><circle key={i} cx={n.x} cy={n.y} r="3" fill="rgba(255,255,255,.45)"/>)}
    </svg>
    <div className="alignment-card"><p>ALINHAMENTO ATUAL</p><strong>72 <small>/ 100</small></strong><span>Em evolução</span>{[["Estratégia",86],["Liderança",64],["Cultura",72]].map(([label,value]) => <div className="progress-row" key={String(label)}><div><span>{label}</span><b>{value}%</b></div><i><motion.em initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: Number(value)/100 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 1.1 }} /></i></div>)}</div>
  </div>;
}
