import { siteConfig } from "@/config/siteConfig";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function FAQ() {
  return (
    <section id="faq" className="py-20">
      <div className="container max-w-4xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Perguntas Frequentes</h2>
          <p className="mt-4 text-muted">Respostas curtas para reduzir objeções antes do WhatsApp.</p>
        </div>
        <Accordion type="single" collapsible className="mt-12 rounded-2xl border border-border bg-white p-4">
          {siteConfig.faq.map((item, idx) => (
            <AccordionItem key={item.q} value={`item-${idx}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}