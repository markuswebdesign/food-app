import { BookOpen, Calendar, ShoppingCart, TrendingUp } from "lucide-react";

const features = [
  { icon: BookOpen, label: "Rezepte verwalten & importieren" },
  { icon: Calendar, label: "Wochenplan erstellen" },
  { icon: ShoppingCart, label: "Einkaufsliste automatisch" },
  { icon: TrendingUp, label: "Kalorien & Nährwerte tracken" },
];

export function BenefitsStrip() {
  return (
    <div id="features" className="bg-[#1D2D18]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#D4A853]/50 flex items-center justify-center bg-[#D4A853]/10">
                <Icon className="w-6 h-6 text-[#D4A853]" />
              </div>
              <span className="text-sm text-white/75 leading-snug font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
