import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Services } from '@/components/Services'
import { MethodMEC } from '@/components/MethodMEC'
import { Stats } from '@/components/Stats'
import { Cases } from '@/components/Cases'
import { Testimonials } from '@/components/Testimonials'
import { Instagram } from '@/components/Instagram'
import { Contact } from '@/components/Contact'
import { CTABanner } from '@/components/CTABanner'
import { FAQ } from '@/components/FAQ'
import { Footer } from '@/components/Footer'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'

export default function App() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <About />
        <Services />
        <MethodMEC />
        <Stats />
        <Cases />
        <Testimonials />
        <Instagram />
        <Contact />
        <CTABanner />
        <FAQ />
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
