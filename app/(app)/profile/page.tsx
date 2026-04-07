import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileHealthForm } from "@/components/profile/profile-health-form";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("weight_kg, height_cm, age, activity_level, goal_type, custom_calorie_goal, username, protein_goal_g, fat_goal_g, carbs_goal_g, hide_global_recipes")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil</h1>
        <p className="text-muted-foreground mt-1">
          {profile?.username && `@${profile.username} · `}Persönliche Einstellungen & Kalorienziel
        </p>
      </div>
      <ProfileHealthForm
        userId={user.id}
        initial={{
          weight_kg: profile?.weight_kg ?? null,
          height_cm: profile?.height_cm ?? null,
          age: profile?.age ?? null,
          activity_level: profile?.activity_level ?? null,
          goal_type: profile?.goal_type ?? null,
          custom_calorie_goal: profile?.custom_calorie_goal ?? null,
          protein_goal_g: profile?.protein_goal_g ?? null,
          fat_goal_g: profile?.fat_goal_g ?? null,
          carbs_goal_g: profile?.carbs_goal_g ?? null,
          hide_global_recipes: profile?.hide_global_recipes ?? false,
        }}
      />
    </div>
  );
}
