import { NextResponse } from "next/server";
import states from "@/lib/data/states.json";

export async function GET() {
  return NextResponse.json({ states });
}
