import { AboutSection } from "@/components/sections/AboutSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { PricingSection } from "@/components/sections/PricingSection";
import { WhatIDo } from "@/components/sections/WhatIDo";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WhatIDo />
        <HowItWorks />
        <PricingSection />
        <FaqSection />
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
