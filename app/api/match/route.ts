import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, matches } = body;

    if (!customerName || !matches || !Array.isArray(matches)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("[match API] OPENROUTER_API_KEY present:", !!apiKey, apiKey?.slice(0, 12));
    if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
      return NextResponse.json(
        matches.map((m: { id: number }, i: number) => ({
          id: m.id ?? i,
          explanation: "",
        })),
        { status: 200 }
      );
    }

    const prompt = `You are a matchmaking assistant for an Indian matrimonial service. For each match below, write one SHORT sentence (max 15 words) explaining why they are compatible with the customer.

Customer: ${customerName}

${matches.map((m: { id: number; firstName: string; city: string; religion: string; caste: string; wantKids: string; openToRelocate: string; hobbies: string[] }, i: number) =>
  `Match ${i}: ${m.firstName}, ${m.city}, ${m.religion}, ${m.caste}, wants kids: ${m.wantKids}, relocate: ${m.openToRelocate}, hobbies: ${m.hobbies?.join(", ") || "none"}`
).join("\n")}

Return ONLY a JSON array of objects with "id" (match index starting from 0) and "explanation" fields. No other text.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const res = await fetch(OPENROUTER_BASE, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tdc-matchmaker.vercel.app",
        "X-Title": "TDC Matchmaker",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        matches.map((m: { id: number }, i: number) => ({ id: m.id ?? i, explanation: "" })),
        { status: 200 }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        matches.map((m: { id: number }, i: number) => ({ id: m.id ?? i, explanation: "" })),
        { status: 200 }
      );
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        matches.map((m: { id: number }, i: number) => ({ id: m.id ?? i, explanation: "" })),
        { status: 200 }
      );
    }

    const explanations = JSON.parse(jsonMatch[0]);
    return NextResponse.json(explanations);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
