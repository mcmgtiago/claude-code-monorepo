import { useState } from "react";
import { Container } from "@/components/common/Container";
import { Reveal } from "@/components/common/Reveal";
import { faq } from "@/data/faq";
import { ChevronDown } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function HomeFAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    if (openId === id) {
      setOpenId(null);
    } else {
      setOpenId(id);
      trackEvent("faq_opened", { id });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-paper">
      <Container size="md">
        <Reveal>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink text-center mb-12">
            Perguntas frequentes
          </h2>
        </Reveal>

        <div className="space-y-3">
          {faq.map((item) => (
            <Reveal key={item.id}>
              <div className="bg-white rounded-xl border border-line overflow-hidden">
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between p-6 text-left gap-4 hover:bg-paper-muted/50 transition-colors"
                  aria-expanded={openId === item.id}
                  aria-controls={`faq-${item.id}`}
                >
                  <span className="font-semibold text-ink text-base">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-ink-soft transition-transform flex-shrink-0 ${
                      openId === item.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openId === item.id && (
                  <div
                    id={`faq-${item.id}`}
                    className="px-6 pb-6 text-ink-soft text-base leading-relaxed border-t border-line pt-4"
                    role="region"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
