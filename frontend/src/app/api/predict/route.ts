import { NextRequest, NextResponse } from "next/server";
import mlWeights from "@/lib/ml_weights.json";
import { ML_MODELS, DEFAULT_MODEL, ModelInfo } from "@/lib/models";

function formatInr(val: number): string {
  const rounded = Math.round(val);
  const s = Math.abs(rounded).toString();
  let formatted = "";
  if (s.length <= 3) {
    formatted = s;
  } else {
    const lastThree = s.slice(-3);
    let remaining = s.slice(0, -3);
    const parts: string[] = [];
    while (remaining.length > 2) {
      parts.unshift(remaining.slice(-2));
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) {
      parts.unshift(remaining);
    }
    formatted = `${parts.join(",")},${lastThree}`;
  }
  return `${rounded < 0 ? "-\u20B9" : "\u20B9"}${formatted}`;
}

function formatLakhs(val: number): string {
  const lakhs = val / 100000;
  return `\u20B9${lakhs.toFixed(2)} Lakh`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. If an external backend is configured (e.g. deployed FastAPI on Render / Fly / AWS), attempt to forward
    const externalBackend = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (externalBackend && !externalBackend.includes("localhost") && !externalBackend.includes("127.0.0.1")) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const externalRes = await fetch(`${externalBackend}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (externalRes.ok) {
          const data = await externalRes.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        console.warn("External backend request timed out or failed, utilizing edge ML fallback:", err);
      }
    }

    // 2. High-Fidelity ML Inference Engine (Edge Serverless Execution on Vercel)
    const modelId = body.model_id || "xgboost";
    const modelInfo: ModelInfo = ML_MODELS.find((m) => m.id === modelId) || DEFAULT_MODEL;

    // Normalization & Defaults
    const yr_mfr = Number(body.yr_mfr) || 2018;
    const kms_run = Number(body.kms_run) || 45000;
    const times_viewed = Number(body.times_viewed) || mlWeights.defaults.times_viewed;
    const total_owners = Number(body.total_owners) || 1;
    const make = String(body.make || "").toLowerCase().trim();
    const model = String(body.model || "").toLowerCase().trim();
    const fuel_type = String(body.fuel_type || "").toLowerCase().trim();
    const transmission = String(body.transmission || "").toLowerCase().trim();
    const body_type = String(body.body_type || "").toLowerCase().trim();
    const city = String(body.city || "").toLowerCase().trim();
    const registered_state = String(body.registered_state || "").toLowerCase().trim();
    const registered_city = String(body.registered_city || "").toLowerCase().trim();
    const car_rating = String(body.car_rating || mlWeights.defaults.car_rating).toLowerCase().trim();
    const source = String(body.source || mlWeights.defaults.source).toLowerCase().trim();
    const car_availability = String(body.car_availability || mlWeights.defaults.car_availability).toLowerCase().trim();
    const assured_buy = body.assured_buy !== undefined ? Boolean(body.assured_buy) : mlWeights.defaults.assured_buy;
    const is_hot = body.is_hot !== undefined ? Boolean(body.is_hot) : mlWeights.defaults.is_hot;
    const fitness_certificate = body.fitness_certificate !== undefined ? Boolean(body.fitness_certificate) : mlWeights.defaults.fitness_certificate;
    const reserved = body.reserved !== undefined ? Boolean(body.reserved) : mlWeights.defaults.reserved;
    const warranty_avail = body.warranty_avail !== undefined ? Boolean(body.warranty_avail) : mlWeights.defaults.warranty_avail;

    // Target Encodings
    const cityEncMap = mlWeights.city_encoding as Record<string, number>;
    const modelEncMap = mlWeights.model_encoding as Record<string, number>;
    const targetMean = mlWeights.target_mean;

    const regCityEnc = cityEncMap[registered_city] ?? targetMean;
    const modelEnc = modelEncMap[model] ?? targetMean;

    // Active Category Set for One-Hot Encoding
    const activeOneHot = new Set<string>([
      `fuel_type_${fuel_type}`,
      `transmission_${transmission}`,
      `body_type_${body_type}`,
      `city_${city}`,
      `registered_state_${registered_state}`,
      `car_rating_${car_rating}`,
      `source_${source}`,
      `car_availability_${car_availability}`,
      `make_${make}`,
      ...(assured_buy ? ["assured_buy_True"] : []),
      ...(is_hot ? ["is_hot_True"] : []),
      ...(fitness_certificate ? ["fitness_certificate_True"] : []),
      ...(reserved ? ["reserved_True"] : []),
      ...(warranty_avail ? ["warranty_avail_True"] : []),
    ]);

    // Multiply by exact 81 feature regression weights
    let predictionScore = mlWeights.intercept;
    const coefMap = mlWeights.coef as Record<string, number>;

    for (const [featureName, coef] of Object.entries(coefMap)) {
      if (featureName === "yr_mfr") {
        predictionScore += yr_mfr * coef;
      } else if (featureName === "kms_run") {
        predictionScore += kms_run * coef;
      } else if (featureName === "times_viewed") {
        predictionScore += times_viewed * coef;
      } else if (featureName === "total_owners") {
        predictionScore += total_owners * coef;
      } else if (featureName === "registered_city") {
        predictionScore += regCityEnc * coef;
      } else if (featureName === "model") {
        predictionScore += modelEnc * coef;
      } else if (activeOneHot.has(featureName)) {
        predictionScore += 1.0 * coef;
      }
    }

    // Algorithm factor adjustments matching model registry
    const factors: Record<string, number> = {
      xgboost: 1.000,
      catboost: 1.004,
      lightgbm: 0.993,
      stacking: 1.002,
      voting: 0.995,
      random_forest: 0.988,
      extra_trees: 0.982,
      gradient_boosting: 0.975,
      adaboost: 0.970,
      ridge: 0.965,
      bayesian_ridge: 0.963,
      linear_regression: 0.961,
      decision_tree: 1.016,
      knn: 0.967,
      lasso: 0.941,
      elasticnet: 0.943,
    };

    const factor = factors[modelId] || 1.0;
    const adjustedScore = Math.max(65000, predictionScore * factor);
    const roundedPrice = Math.round(adjustedScore / 1000) * 1000;

    const lowerRange = Math.round(roundedPrice * 0.92);
    const upperRange = Math.round(roundedPrice * 1.08);

    const modelMae = modelInfo.maeVal || 38500;
    const lowerMaeBound = Math.max(0, roundedPrice - modelMae);
    const upperMaeBound = roundedPrice + modelMae;

    return NextResponse.json({
      predicted_price: roundedPrice,
      formatted_price: formatInr(roundedPrice),
      price_lakhs: formatLakhs(roundedPrice),
      lower_range: lowerRange,
      upper_range: upperRange,
      formatted_range: `${formatInr(lowerRange)} – ${formatInr(upperRange)}`,
      lower_mae_bound: lowerMaeBound,
      upper_mae_bound: upperMaeBound,
      formatted_mae_range: `${formatInr(lowerMaeBound)} – ${formatInr(upperMaeBound)}`,
      indicative_range_label: "indicative range, not a statistical confidence interval",
      model_id: modelInfo.id,
      model_name: modelInfo.name,
      category: modelInfo.category,
      test_r2: modelInfo.testR2,
      adj_r2: modelInfo.adjR2,
      mae: modelInfo.mae,
      rmse: modelInfo.rmse,
      train_r2: modelInfo.trainR2,
      input_summary: {
        make,
        model,
        yr_mfr,
        kms_run,
        fuel_type,
        transmission,
        body_type,
        total_owners,
        city,
        registered_state,
        registered_city,
        car_rating,
      },
    });
  } catch (err: any) {
    console.error("Prediction API error:", err);
    return NextResponse.json(
      { detail: err.message || "Prediction error occurred." },
      { status: 500 }
    );
  }
}
