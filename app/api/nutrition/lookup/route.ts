import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json(null);

  try {
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      system:
        "Du bist ein Ernährungsexperte. Antworte NUR mit einem JSON-Objekt, ohne Markdown. Schätze Nährwerte pro 100g basierend auf typischen Durchschnittswerten.",
      messages: [
        {
          role: "user",
          content: `Nährwerte pro 100g für: "${q}"
JSON-Format:
{"calories_per_100g": number, "protein_per_100g": number, "fat_per_100g": number, "carbs_per_100g": number, "fiber_per_100g": number}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null);
  }
}
