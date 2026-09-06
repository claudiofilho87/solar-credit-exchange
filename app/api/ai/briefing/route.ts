import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import ngos from "@/lib/data/ngos.json";

const bodySchema = z.object({
  ngoId: z.string().min(1),
  creditsKwh: z.number().positive(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ngoId, creditsKwh } = parsed.data;
  const ngo = ngos.find((item) => item.id === ngoId);
  const ngoName = ngo?.name ?? "this NGO";

  // TODO (Step 9): replace with a real call to Gemini via lib/gemini.ts,
  // keeping this same fallback text for when GEMINI_API_KEY is not set.
  const text = `Your donation of ${creditsKwh} kWh in solar credits helps ${ngoName} lower the energy cost for the families it supports.`;

  return NextResponse.json({ text, generated: false });
}
