import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/recipes/recipe-form";

export default async function NewRecipePage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("type");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Neues Rezept</h1>
        <p className="text-muted-foreground mt-1">Füge ein neues Rezept hinzu</p>
      </div>
      <RecipeForm categories={categories ?? []} />
    </div>
  );
}
