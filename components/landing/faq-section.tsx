const faqs = [
  {
    q: "Ist FoodApp wirklich kostenlos?",
    a: "Ja. Du kannst kostenlos starten und alle Kernfunktionen nutzen: Rezepte, Wochenplan, Einkaufsliste und Tracking.",
  },
  {
    q: "Muss ich jeden Tag perfekt tracken?",
    a: "Nein. FoodApp hilft dir dabei, eine Routine aufzubauen — nicht, dich zu kontrollieren. Du entscheidest wie detailliert.",
  },
  {
    q: "Funktioniert das auf dem Handy?",
    a: "Ja. Die Oberfläche ist für mobile Nutzung ausgelegt, ohne App-Installation. Einfach im Browser öffnen.",
  },
  {
    q: "Wie importiere ich Rezepte?",
    a: "Einfach die URL einer Rezeptseite einfügen — FoodApp liest Zutaten, Mengen und Nährwerte automatisch aus.",
  },
];

export function FaqSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F5EFE0]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-16">
          {/* Left label */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#7A7060] mb-3">FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#1D2D18] leading-tight">
              Häufige<br />Fragen
            </h2>
          </div>

          {/* Right: accordion */}
          <div className="border-t border-[#DDD4BC]">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group border-b border-[#DDD4BC] py-6"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 outline-none">
                  <span className="font-display text-lg font-light text-[#1D2D18] leading-snug">
                    {item.q}
                  </span>
                  <span className="text-[#B85630] text-2xl font-light shrink-0 leading-none group-open:rotate-45 transition-transform duration-200 inline-block">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm text-[#7A7060] leading-relaxed font-light max-w-prose">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
