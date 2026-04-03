import Image from "next/image";
import Link from "next/link";

export function HowItWorksSection() {
  return (
    <section id="mission" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#D4A853] font-semibold mb-4">
              Über die App
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-normal text-[#1D2D18] leading-tight mb-6">
              Ein ganzheitlicher Ansatz für
              <span className="text-[#D4A853]"> gesundes Essen.</span>
            </h2>
            <p className="text-base text-[#4B5563] leading-relaxed mb-4">
              FoodApp verbindet Rezeptverwaltung, Wochenplanung und Kalorientracking
              zu einem durchgehenden Flow. Kein ständiges Wechseln zwischen Tools,
              kein Chaos in Notiz-Apps.
            </p>
            <p className="text-base text-[#4B5563] leading-relaxed mb-8">
              Einmal einrichten, dauerhaft profitieren — für alle, die gesünder
              leben möchten, ohne es zur zweiten Arbeit zu machen.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#1D2D18] text-white text-sm font-semibold px-6 py-3 hover:bg-[#2A3F24] transition-colors rounded-sm"
            >
              Jetzt kostenlos starten →
            </Link>
          </div>

          {/* Food photo */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=85"
              alt="Gesunde Mahlzeiten vorbereiten"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
