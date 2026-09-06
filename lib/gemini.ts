import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.7-flash";

type BriefingInput = {
  ngoName: string;
  creditsKwh: number;
};

type BriefingResult = {
  text: string;
  generated: boolean;
};

function fallbackText({ ngoName, creditsKwh }: BriefingInput): string {
  return `Your donation of ${creditsKwh} kWh in solar credits helps ${ngoName} lower the energy cost for the families it supports.`;
}

export async function generateBriefing(input: BriefingInput): Promise<BriefingResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { text: fallbackText(input), generated: false };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Write one short, warm sentence (max 30 words) for a donor who just gave ${input.creditsKwh} kWh of solar energy credits to "${input.ngoName}", a community NGO. Explain the impact in plain language. No greeting, no sign-off, just the sentence.`,
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return { text, generated: true };
  } catch (error) {
    console.error("Gemini request failed, using fallback text:", error);
    return { text: fallbackText(input), generated: false };
  }
}
