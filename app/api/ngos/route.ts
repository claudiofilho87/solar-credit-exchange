import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import ngos from "@/lib/data/ngos.json";

const querySchema = z.object({
  utilityId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    utilityId: request.nextUrl.searchParams.get("utilityId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const matches = ngos.filter((ngo) => ngo.utilityId === parsed.data.utilityId);

  return NextResponse.json({ ngos: matches });
}
