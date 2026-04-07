"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailUnconfirmed, setEmailUnconfirmed] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const confirmationFailed = searchParams.get("error") === "confirmation_failed";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailUnconfirmed(false);

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setEmailUnconfirmed(true);
      } else {
        setError("E-Mail oder Passwort falsch.");
      }
      setLoading(false);
      return;
    }

    // Check if account is banned
    if (signInData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_banned")
        .eq("id", signInData.user.id)
        .single();

      if (profile?.is_banned) {
        await supabase.auth.signOut();
        setError("Dein Account wurde deaktiviert. Bitte kontaktiere den Support.");
        setLoading(false);
        return;
      }
    }

    router.push("/recipes");
    router.refresh();
  }

  async function handleResend() {
    setResendStatus("loading");
    await supabase.auth.resend({ type: "signup", email });
    setResendStatus("sent");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anmelden</CardTitle>
        <CardDescription>Melde dich mit deiner E-Mail an</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {confirmationFailed && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              Der Bestätigungslink ist ungültig oder abgelaufen. Bitte fordere einen neuen an.
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </p>
          )}
          {emailUnconfirmed && (
            <div className="text-sm bg-amber-50 border border-amber-200 p-3 rounded-md space-y-2">
              <p className="text-amber-800">
                Deine E-Mail-Adresse wurde noch nicht bestätigt. Bitte prüfe deinen Posteingang.
              </p>
              {resendStatus === "sent" ? (
                <p className="text-green-700 font-medium">E-Mail wurde erneut gesendet.</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === "loading" || !email}
                  className="text-amber-700 underline font-medium disabled:opacity-50"
                >
                  {resendStatus === "loading" ? "Wird gesendet..." : "Bestätigungs-E-Mail erneut senden"}
                </button>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Anmelden..." : "Anmelden"}
          </Button>
          <div className="flex flex-col gap-2">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline text-center self-center">
              Passwort vergessen?
            </Link>
            <p className="text-sm text-muted-foreground text-center">
              Noch kein Konto?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Registrieren
              </Link>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
