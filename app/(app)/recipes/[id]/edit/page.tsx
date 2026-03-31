import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { RecipeForm } from "@/components/recipes/recipe-form";

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: recipe } = await supabase
    .from("recipes")
    .select("*, recipe_categories(categories(*)), ingredients(*), recipe_nutrition(*)")
    .eq("id", params.id)
    .single();

  if (!recipe || recipe.user_id !== user.id) notFound();

  const { data: categories } = await supabase.from("categories").select("*").order("type");

  const normalized = {
    ...recipe,
    categories: recipe.recipe_categories?.map((rc: any) => rc.categories) ?? [],
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rezept bearbeiten</h1>
        <p className="text-muted-foreground mt-1">{recipe.title}</p>
      </div>
      <RecipeForm categories={categories ?? []} recipe={normalized} />
    </div>
  );
}
