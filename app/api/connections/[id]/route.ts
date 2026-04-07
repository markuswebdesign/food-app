import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PATCH: accept or decline a pending request
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await request.json(); // "accept" | "decline"
  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Only the recipient can accept/decline
  const { data: conn } = await supabase
    .from("connections")
    .select("id, recipient_id, status")
    .eq("id", params.id)
    .single();

  if (!conn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conn.recipient_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (conn.status !== "pending") return NextResponse.json({ error: "Not pending" }, { status: 409 });

  const newStatus = action === "accept" ? "accepted" : "declined";
  const { data: updated } = await supabase
    .from("connections")
    .update({ status: newStatus })
    .eq("id", params.id)
    .select()
    .single();

  return NextResponse.json({ connection: updated });
}

// DELETE: remove a connection (either party can remove)
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: conn } = await supabase
    .from("connections")
    .select("id, requester_id, recipient_id")
    .eq("id", params.id)
    .single();

  if (!conn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conn.requester_id !== user.id && conn.recipient_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase.from("connections").delete().eq("id", params.id);
  return NextResponse.json({ success: true });
}
