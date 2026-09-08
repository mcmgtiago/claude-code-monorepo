import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { WhatsAppButton } from "@/components/navigation/WhatsAppButton";
import { LoadingState } from "@/components/common/LoadingState";

const HomePage = lazy(() => import("@/pages/HomePage"));
const CompaniesPage = lazy(() => import("@/pages/CompaniesPage"));
const CandidatesPage = lazy(() => import("@/pages/CandidatesPage"));
const JobsPage = lazy(() => import("@/pages/JobsPage"));
const JobDetailPage = lazy(() => import("@/pages/JobDetailPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const InsightsPage = lazy(() => import("@/pages/InsightsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <a href="#main-content" className="skip-link">
        Ir para conteúdo principal
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<LoadingState />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/empresas" element={<CompaniesPage />} />
            <Route path="/candidatos" element={<CandidatesPage />} />
            <Route path="/vagas" element={<JobsPage />} />
            <Route path="/vagas/:slug" element={<JobDetailPage />} />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/conteudos" element={<InsightsPage />} />
            <Route path="/contato" element={<ContactPage />} />
            <Route path="/privacidade" element={<PrivacyPage />} />
            <Route path="/termos" element={<TermsPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <WhatsAppButton />
    </BrowserRouter>
  );
}
