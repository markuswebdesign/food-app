import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="grid lg:grid-cols-2 min-h-screen">
      {/* Left: dark green panel with text */}
      <div className="bg-[#1D2D18] flex flex-col justify-center px-10 py-32 lg:px-16 lg:py-0">
        <p className="text-xs uppercase tracking-[0.2em] text-[#D4A853] mb-6 font-medium">
          Deine persönliche Ernährungs-App
        </p>

        <h1 className="font-display text-[clamp(2.6rem,5vw,4.8rem)] font-normal leading-[1.1] tracking-tight text-white mb-6">
          Gesünder essen.
          <br />
          <span className="text-[#D4A853]">Besser fühlen.</span>
        </h1>

        <p className="text-base text-white/65 leading-relaxed max-w-md mb-10">
          Rezepte verwalten, Wochenpläne erstellen und Kalorien tracken —
          alles in einem durchgehenden Flow.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#D4A853] text-[#1D2D18] text-sm font-semibold px-8 py-4 hover:bg-[#C8903A] transition-colors rounded-sm"
          >
            Kostenlos starten →
          </Link>
          <a
            href="#mission"
            className="text-sm text-white/60 hover:text-white transition-colors underline underline-offset-4 decoration-white/20"
          >
            Mehr erfahren
          </a>
        </div>

        <p className="mt-8 text-xs text-white/30">
          Kein Download · Direkt im Browser · Für immer kostenlos
        </p>
      </div>

      {/* Right: full food photo */}
      <div className="relative min-h-[50vh] lg:min-h-0">
        <Image
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=85"
          alt="Bunter gesunder Salat"
          fill
          className="object-cover"
          priority
        />
      </div>
    </section>
  );
}
