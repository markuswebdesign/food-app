import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET: list accepted connections + pending requests for current user
// Also handles user search: GET /api/connections?search=username
export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();

  // User search
  if (search) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `%${search}%`)
      .neq("id", user.id)
      .limit(20);
    return NextResponse.json({ profiles: profiles ?? [] });
  }

  // Accepted connections
  const { data: connections } = await supabase
    .from("connections")
    .select(`
      id, status, created_at,
      requester:profiles!connections_requester_id_fkey(id, username, avatar_url),
      recipient:profiles!connections_recipient_id_fkey(id, username, avatar_url)
    `)
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .in("status", ["accepted", "pending"]);

  return NextResponse.json({ connections: connections ?? [] });
}

// POST: send connection request
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipientId } = await request.json();
  if (!recipientId || recipientId === user.id) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }

  // Check if reverse request exists (mutual: auto-accept)
  const { data: reverse } = await supabase
    .from("connections")
    .select("id, status")
    .eq("requester_id", recipientId)
    .eq("recipient_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (reverse) {
    // Auto-accept the reverse request
    const { data: updated } = await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", reverse.id)
      .select()
      .single();
    return NextResponse.json({ connection: updated, autoAccepted: true });
  }

  // Check for existing request
  const { data: existing } = await supabase
    .from("connections")
    .select("id, status")
    .or(
      `and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`
    )
    .not("status", "eq", "declined")
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Already connected or pending" }, { status: 409 });
  }

  const { data: connection, error } = await supabase
    .from("connections")
    .insert({ requester_id: user.id, recipient_id: recipientId, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ connection }, { status: 201 });
}
