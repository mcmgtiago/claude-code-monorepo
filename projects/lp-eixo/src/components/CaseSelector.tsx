import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { caseStudies } from "../data/content";
import { ease, track } from "../lib/utils";
import { MetricTicker } from "./MetricTicker";

export function CaseSelector() {
  const [active, setActive] = useState(caseStudies[0].id); const study = caseStudies.find((item) => item.id === active)!;
  return <div className="cases-layout">
    <div className="case-tabs" role="tablist" aria-label="Cases ilustrativos">{caseStudies.map((item, index) => <button key={item.id} role="tab" id={`tab-${item.id}`} aria-selected={active === item.id} aria-controls={`panel-${item.id}`} className={active === item.id ? "is-active" : ""} onClick={() => { setActive(item.id); track("case_selected", { id: item.id }); }}><span>0{index + 1}</span><strong>{item.company}</strong><small>{item.sector} · {item.people}</small></button>)}</div>
    <AnimatePresence mode="wait"><motion.article key={study.id} id={`panel-${study.id}`} role="tabpanel" aria-labelledby={`tab-${study.id}`} className="case-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .42, ease }}><div className="case-meta"><span>{study.company}</span><span>{study.sector}</span><span>{study.people}</span></div><div className="case-copy"><div><small>DESAFIO</small><p>{study.challenge}</p></div><div><small>INTERVENÇÃO</small><p>{study.intervention}</p></div></div><blockquote>{study.outcome}</blockquote><div className="case-metrics">{study.metrics.map((metric) => { const delta = Math.abs(metric.after - metric.before); return <div className="metric" key={metric.label}><span>{metric.label}</span><small>Antes: {String(metric.before).replace(".", ",")}{metric.suffix}</small><strong><MetricTicker value={metric.after} suffix={metric.suffix}/></strong><em>{metric.direction === "down" ? <ArrowDownRight size={13}/> : <ArrowUpRight size={13}/>} {String(delta).replace(".", ",")}{metric.suffix}</em><i><b style={{ width: `${Math.min(100, (metric.after / Math.max(metric.before, metric.after)) * 100)}%` }}/></i></div>; })}</div><p className="illustrative-note">DADOS ILUSTRATIVOS · Cenários e indicadores para demonstração da interface.</p></motion.article></AnimatePresence>
  </div>;
}
