import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { BenefitsStrip } from "@/components/landing/benefits-strip";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PreviewSection } from "@/components/landing/preview-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
  title: "FoodApp — Deine smarte Ernährungs-App",
  description:
    "Rezepte verwalten, Wochenpläne erstellen und Kalorien tracken — alles kostenlos an einem Ort.",
};

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/me");

  return (
    <div className="min-h-screen flex flex-col bg-[#F5EFE0]">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <BenefitsStrip />
        <FeaturesSection />
        <HowItWorksSection />
        <PreviewSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
