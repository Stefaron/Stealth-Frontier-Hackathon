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
import SmoothScroll from "@/components/landing/SmoothScroll";
import CursorGlow from "@/components/landing/CursorGlow";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <CursorGlow />
      <ScrollProgress />
      <Navbar />
      <PageTransition>
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
      </PageTransition>
    </>
  );
}
