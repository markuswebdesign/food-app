import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { AdminRecipesTable } from "./recipes-table";

export type AdminRecipe = {
  id: string;
  title: string;
  is_global: boolean;
  is_public: boolean;
  created_at: string;
  username: string | null;
  user_id: string;
};

export default async function AdminRecipesPage() {
  const supabase = createClient();
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: recipesRaw } = await adminClient
    .from("recipes")
    .select("id, title, is_global, is_public, created_at, user_id, profiles!recipes_user_id_fkey(username)")
    .order("is_global", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  const recipes: AdminRecipe[] = (recipesRaw ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    is_global: r.is_global ?? false,
    is_public: r.is_public ?? false,
    created_at: r.created_at,
    user_id: r.user_id,
    username: r.profiles?.username ?? null,
  }));

  const globalCount = recipes.filter((r) => r.is_global).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rezeptverwaltung</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {recipes.length} Rezepte · {globalCount} global
        </p>
      </div>
      <AdminRecipesTable recipes={recipes} />
    </div>
  );
}
