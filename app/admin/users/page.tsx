import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { UsersTable } from "./users-table";

export type AdminUser = {
  id: string;
  username: string;
  full_name: string | null;
  role: string;
  is_banned: boolean;
  created_at: string;
  email: string | null;
  last_sign_in_at: string | null;
};

export default async function AdminUsersPage() {
  const supabase = createClient();
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const [{ data: profiles }, { data: authData }] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, username, full_name, role, is_banned, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  // Merge profiles with auth user data (email, last_sign_in_at)
  const authMap = new Map(
    (authData?.users ?? []).map((u) => [u.id, { email: u.email ?? null, last_sign_in_at: u.last_sign_in_at ?? null }])
  );

  const users: AdminUser[] = (profiles ?? []).map((p) => ({
    ...p,
    role: p.role ?? "user",
    is_banned: p.is_banned ?? false,
    ...authMap.get(p.id) ?? { email: null, last_sign_in_at: null },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nutzerverwaltung</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {users.length} Nutzer registriert
        </p>
      </div>
      <UsersTable users={users} currentUserId={currentUser?.id ?? ""} />
    </div>
  );
}
