"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  if (pw.length < 8) return { level: 1, label: "Niedrig", color: "bg-red-500" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  if (score === 0) return { level: 1, label: "Niedrig", color: "bg-red-500" };
  if (score === 1) return { level: 2, label: "Mittel", color: "bg-yellow-500" };
  return { level: 3, label: "Sicher", color: "bg-green-500" };
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState(false);

  const strength = getPasswordStrength(password);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setAuthError(true);
      }
    }
    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/recipes");
      }, 3000);
    }
  }

  if (authError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link abgelaufen</CardTitle>
          <CardDescription>
            Der Reset-Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3">
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            Der Link wurde bereits verwendet oder ist älter als 1 Stunde.
          </p>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline text-center w-full">
            <Button variant="outline" className="w-full">Neuen Reset-Link anfordern</Button>
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:underline text-center">
            Zurück zum Login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Passwort erfolgreich geändert</CardTitle>
          <CardDescription>
            Dein Passwort wurde erfolgreich aktualisiert. Du wirst gleich weitergeleitet.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" onClick={() => router.push("/recipes")}>
            Weiter zu den Rezepten
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neues Passwort setzen</CardTitle>
        <CardDescription>Wähle ein sicheres neues Passwort für dein Konto.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Neues Passwort</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mindestens 6 Zeichen"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {strength.level > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= strength.level ? strength.color : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  strength.level === 1 ? "text-red-500" :
                  strength.level === 2 ? "text-yellow-600" : "text-green-600"
                }`}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Passwort wiederholen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-red-500">Passwörter stimmen nicht überein.</p>
            )}
            {confirmPassword && confirmPassword === password && (
              <p className="text-xs text-green-600">Passwörter stimmen überein.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Passwort wird geändert..." : "Neues Passwort speichern"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
