import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET: inbox — shared recipes received by current user
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: shared } = await supabase
    .from("shared_recipes")
    .select(`
      id, status, created_at,
      sender:profiles!shared_recipes_sender_id_fkey(id, username, avatar_url),
      recipe:recipes(id, title, description, image_url, servings, prep_time_minutes, cook_time_minutes)
    `)
    .eq("recipient_id", user.id)
    .neq("status", "dismissed")
    .order("created_at", { ascending: false });

  return NextResponse.json({ shared: shared ?? [] });
}

// POST: share a recipe with one or more connections
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipeId, recipientIds } = await request.json();
  if (!recipeId || !Array.isArray(recipientIds) || recipientIds.length === 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Verify user owns the recipe
  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, user_id, is_global")
    .eq("id", recipeId)
    .single();

  if (!recipe || recipe.user_id !== user.id || recipe.is_global) {
    return NextResponse.json({ error: "Cannot share this recipe" }, { status: 403 });
  }

  // Verify all recipients are actual connections
  const { data: connections } = await supabase
    .from("connections")
    .select("requester_id, recipient_id")
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .eq("status", "accepted");

  const connectedIds = new Set(
    (connections ?? []).map((c: any) =>
      c.requester_id === user.id ? c.recipient_id : c.requester_id
    )
  );

  const validRecipients = recipientIds.filter((id: string) => connectedIds.has(id));
  if (validRecipients.length === 0) {
    return NextResponse.json({ error: "No valid recipients" }, { status: 400 });
  }

  // Upsert shares (avoid duplicates — update status back to pending on re-share)
  const rows = validRecipients.map((recipientId: string) => ({
    recipe_id: recipeId,
    sender_id: user.id,
    recipient_id: recipientId,
    status: "pending",
  }));

  const { error } = await supabase
    .from("shared_recipes")
    .upsert(rows, { onConflict: "recipe_id,sender_id,recipient_id", ignoreDuplicates: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, count: validRecipients.length }, { status: 201 });
}
