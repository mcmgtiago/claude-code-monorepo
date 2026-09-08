import { ArrowUpRight } from "lucide-react";
import featureOne from "../assets/feature-1.gif";
import featureTwo from "../assets/feature-2.gif";

const rows = [
  {
    title: "Designed to convert. Built to perform.",
    body: "Every pixel is intentional. Our AI studies what works across thousands of top sites—then builds yours to outperform them all.",
    button: "Learn more",
    image: featureOne,
    reverse: false,
  },
  {
    title: "It gets smarter. Automatically.",
    body: "Your site evolves on its own. AI monitors every click, scroll, and conversion—then optimizes in real time. No manual updates. Ever.",
    button: "See how it works",
    image: featureTwo,
    reverse: true,
  },
];

export default function FeaturesChess() {
  return (
    <section id="work" className="bg-black px-5 py-24 md:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="liquid-glass rounded-full px-3.5 py-1 font-body text-xs font-medium text-white">
            Capabilities
          </span>
          <h2 className="mx-auto mt-6 max-w-3xl font-heading text-4xl italic leading-[0.9] tracking-tight text-white md:text-5xl lg:text-6xl">
            Pro features. Zero complexity.
          </h2>
        </div>

        <div className="space-y-16">
          {rows.map((row) => (
            <div
              key={row.title}
              className={`flex flex-col items-center gap-8 md:gap-12 ${
                row.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
              }`}
            >
              <div className="flex-1 text-center lg:text-left">
                <h3 className="font-heading text-4xl italic leading-[0.9] tracking-tight text-white md:text-5xl">
                  {row.title}
                </h3>
                <p className="mt-5 max-w-xl font-body text-sm font-light leading-relaxed text-white/60 md:text-base">
                  {row.body}
                </p>
                <a
                  href="#book"
                  className="liquid-glass-strong mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-sm font-medium text-white"
                >
                  {row.button} <ArrowUpRight size={16} />
                </a>
              </div>

              <div className="liquid-glass flex-1 rounded-2xl p-2">
                <img
                  src={row.image}
                  alt="Interface preview"
                  className="relative z-10 aspect-[16/10] w-full rounded-[1rem] object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
