import { Header } from "@/components/layout/Header";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhatIDo } from "@/components/sections/WhatIDo";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WhatIDo />
        <HowItWorks />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
