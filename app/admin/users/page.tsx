import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { UserRoleToggle } from "./user-role-toggle";

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: users } = await adminClient
    .from("profiles")
    .select("id, username, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nutzerverwaltung</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {users?.length ?? 0} Nutzer registriert
        </p>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nutzername</th>
              <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Vollständiger Name</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Registriert</th>
              <th className="px-4 py-3 text-left font-medium">Rolle</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {u.full_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {new Date(u.created_at).toLocaleDateString("de-DE")}
                </td>
                <td className="px-4 py-3">
                  <UserRoleToggle
                    userId={u.id}
                    currentRole={u.role ?? "user"}
                    isCurrentUser={u.id === currentUser?.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
