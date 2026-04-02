import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 text-center">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Deine smarte{" "}
          <span className="text-primary">Ernährungs-App</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
          Rezepte verwalten, Wochenpläne erstellen, Kalorien tracken — alles an einem Ort.
        </p>
        <Button asChild size="lg" className="text-base px-8">
          <Link href="/register">Kostenlos starten</Link>
        </Button>
      </div>
    </section>
  );
}
