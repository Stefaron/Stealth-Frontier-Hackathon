import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import UmbraSection from "@/components/landing/UmbraSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";
import ScrollProgress from "@/components/landing/ScrollProgress";
import PageTransition from "@/components/landing/PageTransition";
import ParticleField from "@/components/landing/ParticleField";

export default function Home() {
  return (
    <>
      <span className="bottom-halo" aria-hidden />
      <ParticleField />
      <ScrollProgress />
      <Navbar />
      <PageTransition>
        <div className="relative z-10">
          <main>
            <HeroSection />
            <StatsSection />
            <ProblemSection />
            <HowItWorksSection />
            <UmbraSection />
            <FeaturesSection />
            <CtaSection />
          </main>
          <Footer />
        </div>
      </PageTransition>
    </>
  );
}
