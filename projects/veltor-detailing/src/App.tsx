import { Header } from './components/layout/Header'
import { Hero } from './components/hero/Hero'
import { TrustBar } from './components/trust/TrustBar'
import { Services } from './components/services/Services'
import { WhyVeltor } from './components/why/WhyVeltor'
import { BeforeAfter } from './components/before-after/BeforeAfter'
import { Process } from './components/process/Process'
import { HighlightService } from './components/highlight/HighlightService'
import { Portfolio } from './components/portfolio/Portfolio'
import { Manifesto } from './components/manifesto/Manifesto'
import { Stats } from './components/stats/Stats'
import { Testimonials } from './components/testimonials/Testimonials'
import { CTAImage } from './components/cta/CTAImage'
import { FAQ } from './components/faq/FAQ'
import { Location } from './components/location/Location'
import { CTABottom } from './components/cta/CTABottom'
import { LocalSEO } from './components/seo/LocalSEO'
import { Footer } from './components/layout/Footer'
import { MobileBottomBar } from './components/mobile/MobileBottomBar'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <Manifesto />
        <BeforeAfter />
        <HighlightService />
        <WhyVeltor />
        <Process />
        <Portfolio />
        <Stats />
        <Testimonials />
        <CTAImage />
        <FAQ />
        <Location />
        <LocalSEO />
        <CTABottom />
      </main>
      <Footer />
      <MobileBottomBar />
    </>
  )
}
