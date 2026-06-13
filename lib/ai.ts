"use client";

import { MatchScore } from "./types";

const PROVIDERS = {
  groq: {
    name: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    key: () => process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
  },
  openrouter: {
    name: "openrouter",
    url: "https://openrouter.ai/api/v1/chat/completions",
    model: "openrouter/free",
    key: () => process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "",
  },
};

type Provider = keyof typeof PROVIDERS;

function buildPrompt(customerName: string, allMatches: MatchScore[]): string {
  const topMatches = allMatches.slice(0, 5);
  return `Output EXACTLY this JSON format:
[{"id":0,"explanation":"one sentence"},{"id":1,"explanation":"one sentence"},...]

Customer: ${customerName}

${topMatches.map((m, i) =>
  `Match ${i}: ${m.profile.firstName}, ${m.profile.city}, ${m.profile.religion}, ${m.profile.caste}, kids: ${m.profile.wantKids}, relocate: ${m.profile.openToRelocate}, hobbies: ${m.profile.hobbies.join(", ")}`
).join("\n")}

Only output the JSON array. No other text.`;
}

function extractSentences(matches: MatchScore[], content: string): MatchScore[] {
  return matches.map((m) => {
    const name = m.profile.firstName;
    const regex = new RegExp(`(${name}[^.!?]*[.!?])`, "i");
    const found = content.match(regex);
    if (found && found[1].trim().length > 3) {
      return { ...m, explanation: found[1].trim(), aiEnhanced: true };
    }
    return m;
  });
}

async function callLLM(
  provider: Provider,
  prompt: string
): Promise<{ id: number; explanation: string }[] | null> {
  const cfg = PROVIDERS[provider];
  const apiKey = cfg.key();
  
  console.log(`[ai] ${provider} key:`, !!apiKey, "len:", apiKey?.length);
  
  if (!apiKey || apiKey.length < 10) {
    console.log(`[ai] ${provider} no valid key`);
    return null;
  }

  console.log(`[ai] ${provider} fetching ${cfg.url} with model ${cfg.model}`);
  
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  console.log(`[ai] ${provider} status:`, res.status);
  if (!res.ok) {
    const text = await res.text();
    console.log(`[ai] ${provider} error body:`, text.slice(0, 200));
    return null;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content
    || data.choices?.[0]?.message?.reasoning;
  console.log(`[ai] ${provider} content:`, !!content, content?.slice(0, 80));
  if (!content) return null;

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    const partialMatch = content.match(/\[([\s\S]*)/);
    if (partialMatch && partialMatch[1].includes('"explanation"')) {
      const lastComma = partialMatch[1].lastIndexOf('"}');
      if (lastComma > 0) {
        const fixed = "[" + partialMatch[1].slice(0, lastComma + 2) + "]";
        try {
          const parsed = JSON.parse(fixed);
          console.log(`[ai] ${provider} salvaged partial JSON:`, parsed.length, "items");
          return parsed;
        } catch {}
      }
    }
    console.log(`[ai] ${provider} no JSON match`);
    return null;
  }

  try {
    let jsonStr = jsonMatch[0];
    jsonStr = jsonStr.replace(/"\s*\.\.\.\s*"/g, '"placeholder"');
    const parsed: { id: number; explanation: string }[] = JSON.parse(jsonStr);
    console.log(`[ai] ${provider} parsed:`, parsed.length, "items");
    return parsed;
  } catch (e) {
    console.log(`[ai] ${provider} parse error`);
    return null;
  }
}

export async function enhanceMatchWithAI(
  matches: MatchScore[],
  customerName: string
): Promise<MatchScore[]> {
  const prompt = buildPrompt(customerName, matches);
  const order: Provider[] = ["groq", "openrouter"];

  for (const provider of order) {
    console.log(`[ai] Trying ${provider}...`);
    const explanations = await callLLM(provider, prompt);

    if (explanations) {
      const result = matches.map((m, i) => {
        const enhanced = explanations.find(e => e.id === i);
        if (enhanced && enhanced.explanation) {
          return { ...m, explanation: enhanced.explanation, aiEnhanced: true };
        }
        return m;
      });

      const count = result.filter(m => m.aiEnhanced).length;
      if (count > 0) {
        console.log(`[ai] ${provider} succeeded with ${count} explanations`);
        return result;
      }
    }
    console.log(`[ai] ${provider} failed, trying next...`);
  }

  console.log("[ai] All providers failed, keeping deterministic explanations");
  return matches;
}
