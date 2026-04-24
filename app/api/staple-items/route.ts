import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const MAX_STAPLE_ITEMS = 50;

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("staple_items")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order")
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { count } = await supabase
    .from("staple_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= MAX_STAPLE_ITEMS) {
    return NextResponse.json(
      { error: `Maximale Anzahl von ${MAX_STAPLE_ITEMS} Stammprodukten erreicht.` },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { name, amount, unit, category } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("staple_items")
    .insert({ user_id: user.id, name: name.trim(), amount: amount ?? null, unit: unit ?? null, category: category ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
