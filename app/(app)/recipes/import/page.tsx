import { createClient } from "@/lib/supabase/server";
import { ImportForm } from "@/components/recipes/import-form";

export default async function ImportRecipePage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("type");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rezept importieren</h1>
        <p className="text-muted-foreground mt-1">
          Rezept von einer Website oder Social Media importieren
        </p>
      </div>
      <ImportForm categories={categories ?? []} />
    </div>
  );
}
