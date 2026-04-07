import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("hide_global_recipes")
    .eq("id", user.id)
    .single();

  const newValue = !(profile?.hide_global_recipes ?? false);

  await supabase
    .from("profiles")
    .update({ hide_global_recipes: newValue })
    .eq("id", user.id);

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL("/recipes", origin), 303);
}
