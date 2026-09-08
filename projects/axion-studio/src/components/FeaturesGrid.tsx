import { BarChart3, Palette, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Days, Not Months",
    body: "Concept to launch at a pace that redefines fast. Because waiting isn't a strategy.",
  },
  {
    icon: Palette,
    title: "Obsessively Crafted",
    body: "Every detail considered. Every element refined. Design so precise, it feels inevitable.",
  },
  {
    icon: BarChart3,
    title: "Built to Convert",
    body: "Layouts informed by data. Decisions backed by performance. Results you can measure.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    body: "Enterprise-grade protection comes standard. SSL, DDoS mitigation, compliance. All included.",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="process" className="bg-black px-5 py-24 md:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="liquid-glass rounded-full px-3.5 py-1 font-body text-xs font-medium text-white">
            Why Us
          </span>
          <h2 className="mx-auto mt-6 max-w-3xl font-heading text-4xl italic leading-[0.9] tracking-tight text-white md:text-5xl lg:text-6xl">
            The difference is everything.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }) => (
            <article key={title} className="liquid-glass rounded-2xl p-6">
              <div className="liquid-glass-strong relative z-10 mb-8 flex h-10 w-10 items-center justify-center rounded-full">
                <Icon size={18} className="text-white" />
              </div>
              <h3 className="relative z-10 font-body text-lg font-medium text-white">{title}</h3>
              <p className="relative z-10 mt-3 font-body text-sm font-light leading-relaxed text-white/60">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
