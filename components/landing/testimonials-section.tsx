const testimonials = [
  {
    quote:
      "Endlich höre ich auf, jeden Abend zu überlegen was ich morgen esse. FoodApp hat meinen Alltag wirklich vereinfacht.",
    name: "Sophie M.",
    role: "Nutzerin seit 2025",
  },
  {
    quote:
      "Der Rezept-Import ist ein Gamechanger. Ich kopiere einfach die URL und alle Nährwerte sind sofort da.",
    name: "Tobias R.",
    role: "Nutzer seit 2025",
  },
  {
    quote:
      "Ich habe viele Ernährungs-Apps ausprobiert, aber keine war so unkompliziert. Kein Abo, kein Download — einfach funktioniert.",
    name: "Jana K.",
    role: "Nutzerin seit 2024",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F7F4EE]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#D4A853] font-semibold mb-4">
            Stimmen
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-normal text-[#1D2D18]">
            Was unsere Nutzer sagen
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white p-8 rounded-sm shadow-md border border-[#E5E7EB]"
            >
              <div className="font-display text-5xl font-normal text-[#D4A853] leading-none mb-4">
                &ldquo;
              </div>
              <p className="font-display text-base italic font-normal text-[#1D2D18] leading-relaxed mb-6">
                {t.quote}
              </p>
              <div className="border-t border-[#E5E7EB] pt-4">
                <p className="text-sm font-semibold text-[#1D2D18]">{t.name}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
