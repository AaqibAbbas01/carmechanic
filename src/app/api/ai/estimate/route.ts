import { NextResponse } from "next/server";

type EstimateRequest = {
  issue?: string;
  vehicle?: string;
  service?: string;
  parts?: Array<{ name: string; price: number; partNumber?: string; type?: string }>;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "GEMINI_API_KEY missing. Add it to .env.local to enable AI estimate suggestions." },
        { status: 200 },
      );
    }

    const body = (await request.json()) as EstimateRequest;
    const catalog = (body.parts || [])
      .slice(0, 80)
      .map((part) => `${part.type || "part"}: ${part.name} (${part.partNumber || "-"}) Rs ${part.price}`)
      .join("\n");

    const prompt = `
You are helping an Indian car workshop prepare a customer estimate.
Return only compact JSON with keys: title, notes, items.
items must be an array of objects with name, qty, type. Pick item names only from catalog when possible.

Vehicle: ${body.vehicle || "-"}
Service: ${body.service || "-"}
Customer issue: ${body.issue || "-"}
Catalog:
${catalog || "No catalog items available"}
`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ ok: false, error: data?.error?.message || "Gemini request failed" }, { status: 200 });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonText = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    let suggestion: unknown = { notes: text };
    try {
      suggestion = JSON.parse(jsonText);
    } catch {
      suggestion = { title: "Suggested estimate", notes: text, items: [] };
    }

    return NextResponse.json({ ok: true, suggestion });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to generate estimate suggestion" },
      { status: 200 },
    );
  }
}
