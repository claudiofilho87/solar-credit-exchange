import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import utilities from "@/lib/data/utilities.json";
import { generateTransferRequirements } from "@/lib/gemini";

const bodySchema = z.object({
  utilityId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const utility = utilities.find((item) => item.id === parsed.data.utilityId);

  if (!utility) {
    return NextResponse.json({ error: "Unknown utilityId" }, { status: 400 });
  }

  const requirements = await generateTransferRequirements({
    utilityName: utility.name,
    stateCode: utility.stateCode,
  });

  return NextResponse.json(requirements);
}
