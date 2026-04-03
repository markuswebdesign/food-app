import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-[#142415] py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-10 mb-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div>
            <span className="font-display text-2xl font-semibold text-white block mb-3">
              food<span className="text-[#D4A853]">.</span>
            </span>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Deine persönliche Ernährungs-App — Rezepte, Planung und Tracking
              in einem durchgehenden Flow.
            </p>
          </div>

          {/* App links */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium mb-4">
              App
            </p>
            <ul className="space-y-2">
              {[
                { href: "/register", label: "Kostenlos starten" },
                { href: "/login", label: "Anmelden" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium mb-4">
              Rechtliches
            </p>
            <ul className="space-y-2">
              {[
                { href: "/datenschutz", label: "Datenschutz" },
                { href: "/impressum", label: "Impressum" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-white/20">
          © {new Date().getFullYear()} FoodApp — Ernährungsroutine ohne Overhead
        </p>
      </div>
    </footer>
  );
}
