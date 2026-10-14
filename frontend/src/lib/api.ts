import { CarFormData, PredictionResult, OptionsData, HealthData } from "@/types";
import staticMeta from "./meta.json";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Fallback options in case backend is loading or unavailable
export const fallbackOptions: OptionsData = {
  options: staticMeta.options as Record<string, (string | boolean | number)[]>,
  make_to_models: staticMeta.make_to_models as Record<string, string[]>,
  defaults: staticMeta.defaults,
  limits: {
    yr_mfr_min: 1995,
    yr_mfr_max: 2026,
    kms_run_min: 0,
    kms_run_max: 500000,
    total_owners_min: 1,
    total_owners_max: 6,
  },
};

export async function fetchHealth(): Promise<HealthData> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Health check returned status: ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    throw new Error(`Backend service unreachable: ${err.message}`);
  }
}

export async function fetchOptions(): Promise<OptionsData> {
  try {
    const res = await fetch(`${API_BASE_URL}/options`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.warn("Failed to fetch /options from backend, using static metadata");
      return fallbackOptions;
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend not available yet, using bundled metadata options:", err);
    return fallbackOptions;
  }
}

export async function predictPrice(data: CarFormData): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorDetail = `Prediction failed with status: ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.join(" | ");
        } else {
          errorDetail = String(errJson.detail);
        }
      }
    } catch (_) {
      // Use fallback errorDetail
    }
    throw new Error(errorDetail);
  }

  return await res.json();
}
