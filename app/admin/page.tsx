import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = createClient();
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { data: authData },
    { count: publicRecipes },
    { count: privateRecipes },
  ] = await Promise.all([
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from("recipes").select("*", { count: "exact", head: true }).eq("is_public", true),
    supabase.from("recipes").select("*", { count: "exact", head: true }).eq("is_public", false),
  ]);

  const allUsers = authData?.users ?? [];
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= thirtyDaysAgo
  ).length;

  const stats = [
    { label: "Nutzer gesamt", value: totalUsers, href: "/admin/users" },
    { label: "Aktiv (letzte 30 Tage)", value: activeUsers, href: "/admin/users" },
    { label: "Öffentliche Rezepte", value: publicRecipes ?? 0, href: "/admin/recipes" },
    { label: "Private Rezepte", value: privateRecipes ?? 0, href: "/admin/recipes" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Übersicht und Verwaltung</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
