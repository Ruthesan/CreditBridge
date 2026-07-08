import { MarketingNav } from '../../components/marketing/MarketingNav';
import { Hero } from '../../components/marketing/Hero';
import { ProblemSection } from '../../components/marketing/ProblemSection';
import { HowItWorks } from '../../components/marketing/HowItWorks';
import { Benefits } from '../../components/marketing/Benefits';
import { Features } from '../../components/marketing/Features';
import { Testimonials } from '../../components/marketing/Testimonials';
import { Pricing } from '../../components/marketing/Pricing';
import { CTASection, Footer } from '../../components/marketing/CTAAndFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <Benefits />
        <Features />
        <Testimonials />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
