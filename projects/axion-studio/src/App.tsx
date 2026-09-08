import { motion } from "framer-motion";
import ScrollRevealText from "./components/ScrollRevealText";
import HlsVideo from "./components/HlsVideo";

const NAV_LINKS = ["Work", "Services", "About", "Blog", "Contact"];

const PROJECTS = [
  {
    title: "Nova Finance",
    category: "Brand & Web Design",
    image: "https://motionsites.ai/assets/hero-grow-ai-preview-BlQ8tAQ-.gif",
  },
  {
    title: "Pulse Health",
    category: "AI Web Development",
    image: "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif",
  },
  {
    title: "Drift Studios",
    category: "Website Optimization",
    image: "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif",
  },
  {
    title: "Arc Commerce",
    category: "Brand & Development",
    image: "https://motionsites.ai/assets/hero-neuralyn-preview-Br4FRDQA.gif",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const fadeUpSubtle = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
      <a href="#" className="text-xl font-semibold tracking-tight font-body text-foreground">
        VIRALMEDIA
      </a>
      <ul className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <li key={link}>
            <a href={`#${link.toLowerCase()}`} className="px-4 py-2 text-sm font-medium text-foreground rounded-sm hover:bg-white/10 transition-colors">
              {link}
            </a>
          </li>
        ))}
      </ul>
      <button className="liquid-glass-strong rounded-full px-6 py-2.5 text-sm font-medium text-foreground">
        Get Started
      </button>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-bottom -translate-y-[100px] md:translate-y-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260326_073936_8dd07fdb-4f6b-4220-a3f0-9dedfaab0c88.mp4"
      />
      <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-background to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-end pb-10 md:pb-20 px-8 max-w-6xl mx-auto">
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0} className="flex items-center gap-3 mb-6">
          <div className="flex -space-x-2">
            {[12, 32, 49].map((img) => (
              <img key={img} src={`https://i.pravatar.cc/64?img=${img}`} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-background object-cover" />
            ))}
          </div>
          <span className="text-muted-foreground text-sm">7,000+ brands already transformed</span>
        </motion.div>
        <motion.h1 initial="hidden" animate="show" variants={fadeUp} custom={1} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-[-1px] md:tracking-[-2px] text-foreground max-w-4xl">
          Build Stunning with <span className="font-accent italic font-normal">AI Magic</span>
        </motion.h1>
        <motion.p initial="hidden" animate="show" variants={fadeUp} custom={2} className="text-sm md:text-lg text-muted-foreground whitespace-normal md:whitespace-nowrap mt-6">
          AI-powered websites crafted for beauty, speed, and lasting performance.
        </motion.p>
        <motion.form initial="hidden" animate="show" variants={fadeUp} custom={3} onSubmit={(e) => e.preventDefault()} className="liquid-glass rounded-full p-1.5 md:p-2 max-w-lg w-full mt-8 flex items-center gap-2">
          <input type="email" placeholder="Enter your email" className="flex-1 bg-transparent px-4 py-2 text-sm md:text-base text-foreground placeholder:text-muted-foreground outline-none" />
          <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="bg-foreground text-background rounded-full px-6 py-2 text-sm font-medium whitespace-nowrap">
            SUBSCRIBE
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="bg-background py-32 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <ScrollRevealText
          text="We blend artificial intelligence with human creativity to craft digital experiences that captivate, convert, and scale - building ambitious brands that truly thrive and lead in the modern web."
          className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-[-1px] leading-relaxed font-body text-foreground"
        />
      </div>
    </section>
  );
}

function SelectedWork() {
  return (
    <section className="bg-background py-32 pb-16 px-8">
      <div className="max-w-6xl mx-auto">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="text-4xl md:text-5xl font-medium tracking-[-2px] text-center mb-4 text-foreground">
          Selected <span className="font-accent italic font-normal">Work</span>
        </motion.h2>
        <motion.p initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} custom={1} className="text-muted-foreground text-lg text-center max-w-2xl mx-auto mb-16">
          A curated collection of projects where bold design meets intelligent technology.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECTS.map((project, i) => (
            <motion.div key={project.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }} className="group cursor-pointer">
              <div className="liquid-glass rounded-2xl overflow-hidden aspect-[4/3]">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <h3 className="text-xl font-medium text-foreground font-body mt-4">{project.title}</h3>
              <p className="text-sm text-muted-foreground font-body mt-1">{project.category}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoShowcase() {
  return (
    <section className="relative h-[650px] overflow-hidden -mt-[325px] z-0">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" src="https://media.cleanshot.cloud/media/21620/nKosRonaEKSufJVJ4VtouFhOPkqgJ3dPoQ8ZP52S.mp4" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
}

function CTA() {
  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center z-10">
      <HlsVideo src="https://stream.mux.com/4IMYGcL01xjs7ek5ANO17JC4VQVUTsojZlnw4fXzwSxc.m3u8" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 text-center max-w-3xl px-8">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-2px] text-foreground mb-6">
          Ready to <span className="font-accent italic font-normal">Transform</span> Your Brand?
        </motion.h2>
        <motion.p initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUpSubtle} custom={1} className="text-lg text-muted-foreground mb-10">
          Let's build something extraordinary together.
        </motion.p>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUpSubtle} custom={2} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="bg-foreground text-background rounded-full px-10 py-4 text-sm font-medium hover:opacity-90 transition-opacity">START A PROJECT</button>
          <button className="liquid-glass-strong rounded-full px-10 py-4 text-sm font-medium text-foreground">BOOK A CALL</button>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background border-t border-border px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className="text-xl font-semibold tracking-tight font-body text-foreground mb-4">VIRALMEDIA</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">AI-powered web design agency crafting digital experiences that convert.</p>
          </div>
          <FooterColumn title="Services" items={["Brand Design", "AI Web Design", "AI Web Development", "Optimization"]} />
          <FooterColumn title="Company" items={["About", "Work", "Blog", "Careers"]} />
          <FooterColumn title="Connect" items={["Twitter", "LinkedIn", "Instagram", "Dribbble"]} />
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">© 2026 VIRALMEDIA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-foreground mb-4">{title}</h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item}>
            <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <div className="bg-background text-foreground font-body">
      <Navbar />
      <main>
        <Hero />
        <About />
        <SelectedWork />
        <VideoShowcase />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
