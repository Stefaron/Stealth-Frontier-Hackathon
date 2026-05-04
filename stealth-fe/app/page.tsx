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
import SectionTransition from "@/components/landing/SectionTransition";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <HeroSection />
        <SectionTransition><StatsSection /></SectionTransition>
        <SectionTransition parallax={40}><ProblemSection /></SectionTransition>
        <SectionTransition><HowItWorksSection /></SectionTransition>
        <SectionTransition parallax={30}><UmbraSection /></SectionTransition>
        <SectionTransition><FeaturesSection /></SectionTransition>
        <SectionTransition><CtaSection /></SectionTransition>
      </main>
      <Footer />
    </>
  );
}
