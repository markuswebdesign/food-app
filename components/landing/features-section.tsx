import { BookOpen, Calendar, ShoppingCart, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Rezeptverwaltung & Import",
    description:
      "Eigene Rezepte erstellen, bearbeiten und direkt per URL aus dem Web importieren.",
  },
  {
    icon: Calendar,
    title: "Wochenplanung",
    description:
      "Mahlzeiten für die ganze Woche planen und Rezepte per Drag & Drop einteilen.",
  },
  {
    icon: ShoppingCart,
    title: "Einkaufsliste",
    description:
      "Automatisch aus dem Wochenplan befüllte Einkaufsliste — nie wieder etwas vergessen.",
  },
  {
    icon: Activity,
    title: "Kalorientracking & Nährwerte",
    description:
      "Täglichen Kalorienbedarf berechnen, Mahlzeiten loggen und Nährwerte im Blick behalten.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Alles was du brauchst
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
