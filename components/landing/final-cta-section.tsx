import Link from "next/link";

export function FinalCtaSection() {
  return (
    <section className="bg-[#1D2D18] py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#D4A853] font-semibold mb-6">
          Bereit loszulegen?
        </p>
        <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-normal leading-[1.15] text-white mb-6 max-w-2xl mx-auto">
          Dein erster Wochenplan dauert weniger als{" "}
          <span className="text-[#D4A853]">fünf Minuten.</span>
        </h2>
        <p className="text-base text-white/50 mb-10 max-w-lg mx-auto leading-relaxed">
          Konto erstellen, Rezepte sammeln, Woche planen.
          Kein Download, keine Kreditkarte, kein Risiko.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-3 bg-[#D4A853] text-[#1D2D18] text-sm font-semibold px-10 py-4 hover:bg-[#C8903A] transition-colors rounded-sm"
        >
          Jetzt kostenlos starten →
        </Link>
      </div>
    </section>
  );
}
