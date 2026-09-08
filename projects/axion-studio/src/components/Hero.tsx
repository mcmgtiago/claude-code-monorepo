import { ArrowUpRight, Play } from "lucide-react";
import { motion } from "motion/react";
import BlurText from "./BlurText";

const heroVideo =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";

const partners = ["Stripe", "Vercel", "Linear", "Notion", "Figma"];

const blurIn = {
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  animate: { filter: "blur(0px)", opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <section id="home" className="relative h-[1000px] overflow-visible bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero_bg.jpeg"
        className="absolute left-0 z-0 h-auto w-full object-contain"
        style={{ top: "20%" }}
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-0 bg-black/5" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-[300px] bg-gradient-to-b from-transparent to-black" />

      <div className="relative z-10 flex h-full flex-col items-center px-5 pt-[150px] text-center">
        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 16 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="liquid-glass mb-7 inline-flex items-center gap-2 rounded-full px-1 py-1 font-body text-xs font-medium text-white/80"
        >
          <span className="relative z-10 rounded-full bg-white px-3 py-1 font-semibold text-black">New</span>
          <span className="relative z-10 pr-3">Introducing AI-powered web design.</span>
        </motion.div>

        <h1 className="max-w-2xl text-6xl font-heading italic leading-[0.8] tracking-[-4px] text-foreground md:text-7xl lg:text-[5.5rem]">
          <BlurText text="The Website Your Brand Deserves" delay={100} direction="bottom" />
        </h1>

        <motion.p
          {...blurIn}
          transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          className="mt-7 max-w-lg font-body text-sm font-light leading-tight text-white md:text-base"
        >
          Stunning design. Blazing performance. Built by AI, refined by experts. This is web design,
          wildly reimagined.
        </motion.p>

        <motion.div
          {...blurIn}
          transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
          className="mt-8 flex flex-wrap items-center justify-center gap-5"
        >
          <a
            href="#book"
            className="liquid-glass-strong relative z-10 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-sm font-medium text-white"
          >
            Get Started <ArrowUpRight size={16} />
          </a>
          <a href="#film" className="inline-flex items-center gap-2 font-body text-sm font-medium text-white">
            <Play size={14} fill="currentColor" /> Watch the Film
          </a>
        </motion.div>

        <div className="mt-auto w-full pb-8 pt-16">
          <div className="mb-8 flex justify-center">
            <span className="liquid-glass rounded-full px-4 py-1.5 font-body text-xs font-medium text-white/70">
              Trusted by the teams behind
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            {partners.map((partner) => (
              <span key={partner} className="font-heading text-2xl italic text-white md:text-3xl">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
