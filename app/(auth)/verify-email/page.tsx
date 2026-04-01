"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const supabase = createClient();
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleResend() {
    if (!email) return;
    setResendStatus("loading");
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResendStatus(error ? "error" : "sent");
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle>Fast geschafft!</CardTitle>
        <CardDescription>
          Bitte bestätige deine E-Mail-Adresse um fortzufahren.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {email && (
          <p className="text-sm text-muted-foreground">
            Wir haben eine Bestätigungs-E-Mail an{" "}
            <span className="font-medium text-foreground">{email}</span> gesendet.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Klicke auf den Link in der E-Mail um dein Konto zu aktivieren.
          Prüfe auch deinen Spam-Ordner.
        </p>

        {resendStatus === "sent" && (
          <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
            E-Mail wurde erneut gesendet. Bitte prüfe deinen Posteingang.
          </p>
        )}
        {resendStatus === "error" && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            Fehler beim Senden. Bitte versuche es später erneut.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={resendStatus === "loading" || resendStatus === "sent" || !email}
        >
          {resendStatus === "loading" ? "Wird gesendet..." : "E-Mail erneut senden"}
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          <Link href="/login" className="text-primary hover:underline">
            Zurück zum Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
