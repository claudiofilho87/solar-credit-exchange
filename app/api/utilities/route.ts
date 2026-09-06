import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import utilities from "@/lib/data/utilities.json";

const querySchema = z.object({
  stateCode: z.string().length(2),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    stateCode: request.nextUrl.searchParams.get("stateCode"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const stateCode = parsed.data.stateCode.toUpperCase();
  const matches = utilities.filter((utility) => utility.stateCode === stateCode);

  return NextResponse.json({ utilities: matches });
}
