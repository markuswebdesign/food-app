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
    <div className="min-h-screen flex flex-col bg-[radial-gradient(900px_520px_at_15%_-10%,rgba(15,23,42,0.06),transparent_60%),radial-gradient(900px_520px_at_90%_0%,rgba(13,148,136,0.08),transparent_62%),linear-gradient(180deg,#ffffff_0%,#ffffff_55%,#ffffff_100%)]">
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
