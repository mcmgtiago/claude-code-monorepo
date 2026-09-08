import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Blog } from "./components/sections/Blog";
import { Cases } from "./components/sections/Cases";
import { Differentials } from "./components/sections/Differentials";
import { FAQ } from "./components/sections/FAQ";
import { FinalCTA } from "./components/sections/FinalCTA";
import { Hero } from "./components/sections/Hero";
import { Pricing } from "./components/sections/Pricing";
import { ProblemSolution } from "./components/sections/ProblemSolution";
import { Process } from "./components/sections/Process";
import { SocialProof } from "./components/sections/SocialProof";
import { Solutions } from "./components/sections/Solutions";
import { Testimonials } from "./components/sections/Testimonials";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <Solutions />
        <Differentials />
        <SocialProof />
        <Cases />
        <Process />
        <Testimonials />
        <Pricing />
        <FAQ />
        <Blog />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}