import { ArrowUpRight } from "lucide-react";
import logoIcon from "../assets/logo-icon.png";

const navLinks = ["Home", "Services", "Work", "Process", "Pricing"];

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-4 z-50 px-8 py-3 lg:px-16">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="#" className="flex items-center" aria-label="Axion Studio home">
          <img src={logoIcon} alt="" className="h-12 w-12 rounded-full" />
        </a>

        <div className="liquid-glass hidden items-center rounded-full px-1.5 py-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="relative z-10 rounded-full px-3 py-2 font-body text-sm font-medium text-foreground/90 transition-colors hover:text-white"
            >
              {link}
            </a>
          ))}
          <a
            href="#book"
            className="relative z-10 ml-1 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 font-body text-sm font-medium text-black transition-transform hover:scale-[1.03]"
          >
            Get Started <ArrowUpRight size={14} />
          </a>
        </div>

        <a
          href="#book"
          className="liquid-glass-strong relative z-10 inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-body text-sm font-medium text-white md:hidden"
        >
          Start <ArrowUpRight size={14} />
        </a>
      </div>
    </nav>
  );
}
