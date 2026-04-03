import Image from "next/image";

const features = [
  {
    num: "01",
    title: "Rezeptverwaltung",
    description:
      "Deine eigene Bibliothek — ohne Bookmark-Chaos. Rezepte direkt per URL importieren: Zutaten, Mengen und Nährwerte werden automatisch ausgelesen und gespeichert.",
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=700&q=85",
    imageAlt: "Frische Zutaten und Rezepte",
  },
  {
    num: "02",
    title: "Wochenplanung",
    description:
      "Einmal planen, die ganze Woche entspannter. Rezepte per Drag & Drop zuordnen — Frühstück, Mittag, Abend für jeden Tag. Die Einkaufsliste wird automatisch daraus erstellt.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=700&q=85",
    imageAlt: "Wochenplan und Meal Prep",
  },
  {
    num: "03",
    title: "Kalorien & Nährwerte",
    description:
      "Tracking, das nicht zur zweiten Arbeit wird. Kalorien, Protein, Fett, Kohlenhydrate — immer im Blick, nie überwältigend. Dein tägliches Defizit auf einen Blick.",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=700&q=85",
    imageAlt: "Gesundes Essen mit Nährwerten",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F7F4EE]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#D4A853] font-semibold mb-4">
            Funktionen
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-normal text-[#1D2D18]">
            Alles, was du brauchst
          </h2>
        </div>

        <div className="space-y-20">
          {features.map((f, i) => (
            <div key={f.num} className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text */}
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <span className="font-display text-5xl font-normal text-[#D4A853]/40 block mb-4 leading-none">
                  {f.num}
                </span>
                <h3 className="font-display text-2xl md:text-3xl font-normal text-[#1D2D18] mb-4">
                  {f.title}
                </h3>
                <p className="text-base text-[#4B5563] leading-relaxed">
                  {f.description}
                </p>
              </div>

              {/* Image */}
              <div
                className={`relative aspect-[4/3] overflow-hidden rounded-sm shadow-md ${
                  i % 2 === 1 ? "lg:order-1" : ""
                }`}
              >
                <Image src={f.image} alt={f.imageAlt} fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
