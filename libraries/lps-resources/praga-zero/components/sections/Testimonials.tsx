"use client";

import { Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { siteConfig } from "@/config/siteConfig";
import { Card } from "@/components/ui/card";

export function Testimonials() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [Autoplay({ delay: 5000, stopOnMouseEnter: true })]);
  return (
    <section className="bg-surface py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">O que dizem nossos clientes</h2>
          <p className="mt-4 text-muted">Depoimentos que passam confiança antes do primeiro contato.</p>
        </div>
        <div className="mt-12 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {siteConfig.testimonials.map((testimonial) => (
              <Card key={`${testimonial.name}-${testimonial.district}`} className="min-w-0 flex-[0_0_86%] p-6 sm:flex-[0_0_48%] lg:flex-[0_0_32%]">
                <div className="flex gap-1 text-warning" aria-label={`${testimonial.rating} estrelas`}>
                  {Array.from({ length: testimonial.rating }).map((_, i) => <Star key={i} className="h-5 w-5 fill-current" aria-hidden="true" />)}
                </div>
                <p className="mt-5 italic text-text">“{testimonial.text}”</p>
                <div className="mt-6">
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-xs text-muted">{testimonial.district}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}