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

type RequirementsInput = {
  utilityName: string;
  stateCode: string;
};

type RequirementsSource = {
  title: string;
  url: string;
};

type RequirementsResult = {
  items: string[];
  sources: RequirementsSource[];
  generated: boolean;
};

// Generic ANEEL net-metering (compensação de energia elétrica) requirements,
// used when we have no API key, the search grounding fails, or the model
// couldn't find utility-specific information.
const FALLBACK_REQUIREMENTS = [
  "Consumer unit (UC) number for both the donor and the receiving family, as registered with the utility",
  "CPF/CNPJ of the account holder(s) involved in the credit transfer request",
  "A signed request form (or the utility's online self-service equivalent) authorizing the energy credit allocation",
  "Confirmation that both consumer units fall under the same distributor's concession area, per ANEEL's compensation rules",
];

export async function generateTransferRequirements(input: RequirementsInput): Promise<RequirementsResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallback: RequirementsResult = { items: FALLBACK_REQUIREMENTS, sources: [], generated: false };

  if (!apiKey) {
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Search for the typical documents and information required by ${input.utilityName}, the electricity distributor for the state of ${input.stateCode} in Brazil, to register or transfer solar energy credits between consumer units under ANEEL's net-metering compensation rules (Sistema de Compensação de Energia Elétrica). Reply with 3 to 6 short items, one per line, plain text, no numbering or markdown. If you can't find utility-specific information, describe the general ANEEL compensation requirements instead.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const items = text
      .split("\n")
      .map((line) => line.replace(/^[-*•\d.]+\s*/, "").trim())
      .filter(Boolean);

    if (items.length === 0) {
      throw new Error("No requirement items parsed from Gemini response");
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: RequirementsSource[] = groundingChunks
      .map((chunk) => chunk.web)
      .filter((web): web is { uri: string; title?: string } => Boolean(web?.uri))
      .map((web) => ({ title: web.title ?? web.uri, url: web.uri }))
      .slice(0, 5);

    return { items, sources, generated: true };
  } catch (error) {
    console.error("Gemini requirements search failed, using fallback text:", error);
    return fallback;
  }
}
