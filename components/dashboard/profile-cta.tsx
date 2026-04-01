import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export function ProfileCTA() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <UserCircle className="h-12 w-12 text-muted-foreground opacity-50" />
        <div>
          <p className="font-semibold text-base">Profil noch nicht ausgefüllt</p>
          <p className="text-sm text-muted-foreground mt-1">
            Um dein Kaloriendefizit zu berechnen, brauchen wir dein Gesundheitsprofil.
          </p>
        </div>
        <Button asChild>
          <Link href="/profile">Profil vervollständigen</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
