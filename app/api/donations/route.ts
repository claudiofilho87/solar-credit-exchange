import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import utilities from "@/lib/data/utilities.json";
import ngos from "@/lib/data/ngos.json";
import { prisma } from "@/lib/db";

const bodySchema = z.object({
  stateCode: z.string().length(2),
  utilityId: z.string().min(1),
  ngoId: z.string().min(1),
  creditsKwh: z.number().positive(),
  amountBrl: z.number().positive().optional(),
  paymentMethod: z.enum(["pix", "paypal", "credit_card", "debit_card"]),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { stateCode, utilityId, ngoId, creditsKwh, amountBrl, paymentMethod } = parsed.data;

  const utility = utilities.find((item) => item.id === utilityId);
  const ngo = ngos.find((item) => item.id === ngoId);

  if (!utility || !ngo) {
    return NextResponse.json({ error: "Unknown utilityId or ngoId" }, { status: 400 });
  }

  const donation = await prisma.donation.create({
    data: {
      stateCode: stateCode.toUpperCase(),
      utilityId: utility.id,
      utilityName: utility.name,
      ngoId: ngo.id,
      ngoName: ngo.name,
      creditsKwh,
      amountBrl,
      paymentMethod,
    },
  });

  return NextResponse.json({ success: true, donation });
}
