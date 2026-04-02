import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Ungültiges Format. Erlaubt: JPG, PNG, WebP" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Datei zu groß. Maximal 5 MB erlaubt" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const fileName = `${user.id}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, buffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  // Add cache-buster so browser picks up the new image
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: "Profil konnte nicht aktualisiert werden" }, { status: 500 });
  }

  return NextResponse.json({ avatar_url: avatarUrl });
}

export async function DELETE() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fileName = `${user.id}.webp`;

  await supabase.storage.from("avatars").remove([fileName]);

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Profil konnte nicht aktualisiert werden" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
