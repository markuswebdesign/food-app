import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WeekPlan } from "@/components/meal-plan/week-plan";

export default async function MealPlanPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: recipesRaw }, { data: categories }] = await Promise.all([
    supabase
      .from("recipes")
      .select("id, title, image_url, recipe_categories(categories(slug))")
      .or(`is_public.eq.true,user_id.eq.${user.id}`)
      .order("title"),
    supabase
      .from("categories")
      .select("id, slug, name, icon, type")
      .order("type"),
  ]);

  const recipes = (recipesRaw ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    image_url: r.image_url,
    category_slugs:
      r.recipe_categories
        ?.map((rc: any) => rc.categories?.slug)
        .filter(Boolean) ?? [],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wochenplan</h1>
        <p className="text-muted-foreground mt-1">Plane deine Mahlzeiten für die Woche</p>
      </div>
      <WeekPlan recipes={recipes} categories={categories ?? []} />
    </div>
  );
}
