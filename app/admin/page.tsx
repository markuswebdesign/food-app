import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = createClient();

  const [{ count: userCount }, { count: recipeCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("recipes").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Übersicht und Verwaltung</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/users">
          <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">Nutzer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{userCount ?? 0}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/recipes">
          <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">Rezepte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{recipeCount ?? 0}</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
