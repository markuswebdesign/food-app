const steps = [
  {
    num: "1",
    title: "Rezepte sammeln",
    description:
      "Speichere eigene Rezepte oder importiere sie per URL. Deine persönliche Bibliothek statt verstreuter Lesezeichen.",
  },
  {
    num: "2",
    title: "Woche vorbereiten",
    description:
      "Plane Frühstück, Mittag, Abend — für die Tage die du möchtest. Einmal entscheiden statt täglich improvisieren.",
  },
  {
    num: "3",
    title: "Routine aufbauen",
    description:
      "Einkauf ableiten, Kalorien tracken, dranbleiben. Das System trägt sich selbst, wenn es einmal eingerichtet ist.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F5EFE0]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-[#7A7060] mb-3">
            So funktioniert es
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light text-[#1D2D18] max-w-md leading-tight">
            Drei Schritte.<br />
            <em className="not-italic text-[#B85630]">Eine Gewohnheit.</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-0">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`relative py-8 md:py-0 ${
                i < steps.length - 1
                  ? "border-b md:border-b-0 md:border-r border-[#DDD4BC]"
                  : ""
              } ${i > 0 ? "md:pl-10" : ""} ${i < steps.length - 1 ? "md:pr-10" : ""}`}
            >
              <span className="font-display text-[5rem] md:text-[7rem] font-light leading-none text-[#DDD4BC] block mb-2">
                {step.num}
              </span>
              <h3 className="font-display text-xl md:text-2xl font-light text-[#1D2D18] mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-[#7A7060] leading-relaxed font-light">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
