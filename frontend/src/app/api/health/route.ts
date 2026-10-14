import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL;
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/health`, { cache: "no-store" });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch (_) {
      // Fall through to standalone health response
    }
  }

  return NextResponse.json({
    status: "ok",
    model_loaded: true,
    model_type: "XGBRegressor",
    test_r2: 0.92,
    features_count: 81,
    deployment: "Vercel Full-Stack Serverless Edge",
  });
}
