import Link from "next/link";

export function FinalCtaSection() {
  return (
    <section className="bg-[#1D2D18] py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-[#F5EFE0]/30 mb-6">
            Bereit?
          </p>
          <h2 className="font-display text-[clamp(2.2rem,5vw,4.5rem)] font-light leading-[1.1] text-[#F5EFE0] mb-6">
            Dein erster Wochenplan
            <br />
            dauert{" "}
            <em className="not-italic text-[#B85630]">weniger als</em>
            <br />
            fünf Minuten.
          </h2>
          <p className="text-sm text-[#F5EFE0]/40 mb-10 font-light leading-relaxed">
            Konto erstellen, Rezepte sammeln, Woche planen. <br className="hidden md:block" />
            Kein Download, keine Kreditkarte, kein Risiko.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 bg-[#B85630] text-[#F5EFE0] text-sm font-medium px-8 py-4 hover:bg-[#9A4220] transition-colors"
          >
            Jetzt kostenlos starten
            <span className="text-base">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
