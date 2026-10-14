import { NextResponse } from "next/server";
import staticMeta from "@/lib/meta.json";

export async function GET() {
  return NextResponse.json({
    options: staticMeta.options,
    make_to_models: staticMeta.make_to_models,
    defaults: staticMeta.defaults,
    limits: {
      yr_mfr_min: 1995,
      yr_mfr_max: 2026,
      kms_run_min: 0,
      kms_run_max: 500000,
      total_owners_min: 1,
      total_owners_max: 6,
    },
  });
}
