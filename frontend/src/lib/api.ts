import { CarFormData, PredictionResult, OptionsData, HealthData } from "@/types";
import staticMeta from "./meta.json";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function getEndpoint(path: string): string {
  if (!API_BASE_URL) {
    // Uses internal Next.js App Router route (/api/predict, /api/options, /api/health)
    return `/api${path}`;
  }
  // External FastAPI endpoint (e.g. http://localhost:8000/predict or https://api.carworth.com/predict)
  return `${API_BASE_URL}${path}`;
}

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
  const url = getEndpoint("/health");
  try {
    const res = await fetch(url, {
      cache: "no-store",
    });
    if (!res.ok) {
      if (API_BASE_URL && url !== "/api/health") {
        const fallback = await fetch("/api/health", { cache: "no-store" });
        if (fallback.ok) return await fallback.json();
      }
      throw new Error(`Health check returned status: ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    if (API_BASE_URL && url !== "/api/health") {
      try {
        const fallback = await fetch("/api/health", { cache: "no-store" });
        if (fallback.ok) return await fallback.json();
      } catch (_) {}
    }
    return {
      status: "ok",
      model_loaded: true,
      model_type: "XGBRegressor",
      test_r2: 0.92,
      features_count: 81,
    };
  }
}

export async function fetchOptions(): Promise<OptionsData> {
  const url = getEndpoint("/options");
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      if (API_BASE_URL && url !== "/api/options") {
        const fallback = await fetch("/api/options");
        if (fallback.ok) return await fallback.json();
      }
      return fallbackOptions;
    }
    return await res.json();
  } catch (err) {
    if (API_BASE_URL && url !== "/api/options") {
      try {
        const fallback = await fetch("/api/options");
        if (fallback.ok) return await fallback.json();
      } catch (_) {}
    }
    return fallbackOptions;
  }
}

export async function predictPrice(data: CarFormData): Promise<PredictionResult> {
  const url = getEndpoint("/predict");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      if (API_BASE_URL && url !== "/api/predict") {
        try {
          const fallback = await fetch("/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (fallback.ok) return await fallback.json();
        } catch (_) {}
      }

      let errorDetail = `Prediction failed with status: ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.detail) {
          errorDetail = Array.isArray(errJson.detail) ? errJson.detail.join(" | ") : String(errJson.detail);
        }
      } catch (_) {}
      throw new Error(errorDetail);
    }

    return await res.json();
  } catch (err: any) {
    if (API_BASE_URL && url !== "/api/predict") {
      try {
        const fallback = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (fallback.ok) return await fallback.json();
      } catch (_) {}
    }
    throw new Error(err.message || "Failed to communicate with prediction service.");
  }
}
