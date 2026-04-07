"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";

interface ProfileAvatarProps {
  userId: string;
  username: string;
  currentAvatarUrl: string | null;
}

export function ProfileAvatar({ userId: _userId, username, currentAvatarUrl }: ProfileAvatarProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initials = username.slice(0, 2).toUpperCase();

  function centerCropToSquare(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas nicht verfügbar")); return; }
        ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Konvertierung fehlgeschlagen"));
        }, "image/webp", 0.9);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Bild konnte nicht geladen werden")); };
      img.src = url;
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    let blob: Blob;
    try {
      blob = await centerCropToSquare(file);
    } catch {
      setError("Bild konnte nicht verarbeitet werden");
      return;
    }

    const formData = new FormData();
    formData.append("file", blob, "avatar.webp");

    startTransition(async () => {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload fehlgeschlagen");
        return;
      }

      setAvatarUrl(data.avatar_url);
      router.refresh();
    });

    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  async function handleDelete() {
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Löschen fehlgeschlagen");
        return;
      }

      setAvatarUrl(null);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
          aria-label="Profilbild ändern"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            {isPending ? "Wird hochgeladen..." : "Bild ändern"}
          </Button>
          {avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG oder WebP, max. 5 MB</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
