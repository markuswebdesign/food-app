import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "Ist FoodApp wirklich kostenlos?",
    a: "Ja. Du kannst kostenlos starten und die Kernfunktionen nutzen: Rezepte, Wochenplan, Einkaufsliste und Tracking-Grundlagen.",
  },
  {
    q: "Muss ich jeden Tag alles perfekt tracken?",
    a: "Nein. FoodApp ist so gedacht, dass Tracking hilft, aber nicht stresst. Du entscheidest, wie detailliert du loggst.",
  },
  {
    q: "Funktioniert das auch auf dem Handy?",
    a: "Ja. Die Oberfläche ist responsiv und auf mobile Nutzung ausgelegt, ohne dass du eine App installieren musst.",
  },
];

export function FaqSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <HelpCircle className="h-4 w-4 text-teal-700" />
            Kurz beantwortet
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Häufige Fragen
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Wenn du unsicher bist, fang klein an. Der Flow ist so gebaut, dass du dich nicht festfährst.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-4">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-[1.25rem] border border-slate-200 bg-white/85 p-6 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.4)]"
            >
              <summary className="cursor-pointer list-none select-none text-base font-semibold text-slate-950 outline-none">
                <div className="flex items-center justify-between gap-4">
                  <span>{item.q}</span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-transform group-open:rotate-45">
                    +
                  </span>
                </div>
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
