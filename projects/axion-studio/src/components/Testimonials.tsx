const testimonials = [
  {
    quote:
      "A complete rebuild in five days. The result outperformed everything we'd spent months building before.",
    name: "Sarah Chen",
    role: "CEO, Luminary",
  },
  {
    quote:
      "Conversions up 4x. That's not a typo. The design just works differently when it's built on real data.",
    name: "Marcus Webb",
    role: "Head of Growth, Arcline",
  },
  {
    quote:
      "They didn't just design our site. They defined our brand. World-class doesn't begin to cover it.",
    name: "Elena Voss",
    role: "Brand Director, Helix",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-black px-5 py-24 md:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="liquid-glass rounded-full px-3.5 py-1 font-body text-xs font-medium text-white">
            What They Say
          </span>
          <h2 className="mx-auto mt-6 max-w-3xl font-heading text-4xl italic leading-[0.9] tracking-tight text-white md:text-5xl lg:text-6xl">
            Don't take our word for it.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="liquid-glass rounded-2xl p-8">
              <p className="relative z-10 font-body text-sm font-light italic leading-relaxed text-white/80">
                “{testimonial.quote}”
              </p>
              <div className="relative z-10 mt-10">
                <div className="font-body text-sm font-medium text-white">{testimonial.name}</div>
                <div className="mt-1 font-body text-xs font-light text-white/50">{testimonial.role}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
