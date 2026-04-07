import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set_role"),
    userId: z.string().uuid(),
    role: z.enum(["admin", "user"]),
  }),
  z.object({
    action: z.literal("set_banned"),
    userId: z.string().uuid(),
    banned: z.boolean(),
  }),
]);

async function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };

  return { user, error: null };
}

export async function PATCH(request: Request) {
  const { user: callerUser, error: authError } = await requireAdmin();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const adminClient = await getAdminClient();

  if (parsed.data.action === "set_role") {
    const { userId, role } = parsed.data;

    if (userId === callerUser!.id && role !== "admin") {
      return NextResponse.json(
        { error: "Du kannst dir selbst die Admin-Rolle nicht entziehen." },
        { status: 400 }
      );
    }

    const { error } = await adminClient.from("profiles").update({ role }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  }

  if (parsed.data.action === "set_banned") {
    const { userId, banned } = parsed.data;

    if (userId === callerUser!.id) {
      return NextResponse.json(
        { error: "Du kannst deinen eigenen Account nicht deaktivieren." },
        { status: 400 }
      );
    }

    const { error } = await adminClient.from("profiles").update({ is_banned: banned }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Invalidate all sessions of the banned user
    if (banned) {
      await adminClient.auth.admin.signOut(userId, "global");
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const adminClient = await getAdminClient();
  const { data, error } = await adminClient.from("profiles")
    .select("id, username, full_name, role, created_at, is_banned")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: data });
}
