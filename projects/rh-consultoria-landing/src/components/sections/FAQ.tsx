import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { FAQ as FAQ_ITEMS } from "../../data/content";
import { FadeUp } from "../ui/FadeUp";
import { SectionHeader } from "../ui/SectionHeader";

export function FAQ() {
  return (
    <section id="faq" className="section-pad bg-white">
      <div className="container-narrow">
        <SectionHeader
          eyebrow="FAQ"
          title="Perguntas frequentes"
          description="Tudo que você precisa saber antes de iniciar uma conversa estratégica conosco."
        />
        <FadeUp>
          <Accordion.Root type="single" collapsible className="grid gap-3">
            {FAQ_ITEMS.map((item) => (
              <Accordion.Item
                key={item.id}
                value={item.id}
                className="overflow-hidden rounded-[20px] border border-black/5 bg-[var(--color-paper-soft)]"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 px-5 py-5 text-left text-base font-bold tracking-tight text-[var(--color-ink)] outline-none transition-colors hover:bg-black/[0.03] md:px-7 md:text-lg">
                    {item.question}
                    <ChevronDown className="size-5 shrink-0 text-[var(--color-brand-blue)] transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[accordion-up_0.25s_ease-out] data-[state=open]:animate-[accordion-down_0.25s_ease-out]">
                  <div className="px-5 pb-6 text-base leading-8 text-[var(--color-ink-soft)] md:px-7">
                    {item.answer}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </FadeUp>
      </div>
    </section>
  );
}