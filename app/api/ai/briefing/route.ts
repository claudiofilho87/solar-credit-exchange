import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import ngos from "@/lib/data/ngos.json";
import { generateBriefing } from "@/lib/gemini";

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

  const briefing = await generateBriefing({ ngoName, creditsKwh });

  return NextResponse.json(briefing);
}
