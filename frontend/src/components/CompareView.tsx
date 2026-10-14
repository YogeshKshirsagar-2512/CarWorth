"use client";

import React, { useState } from "react";
import { CarFormData, PredictionResult, OptionsData } from "@/types";
import { CarForm } from "./CarForm";
import { ResultCard } from "./ResultCard";
import { ModelBenchmark } from "./ModelBenchmark";
import { predictPrice } from "@/lib/api";
import { 
  GitCompare, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Layers,
  Sparkles
} from "lucide-react";

interface CompareViewProps {
  optionsData: OptionsData;
  initialTab?: "benchmarks" | "vehicles";
}

export function CompareView({ optionsData, initialTab = "benchmarks" }: CompareViewProps) {
  const [activeTab, setActiveTab] = useState<"benchmarks" | "vehicles">(initialTab);

  const [resultA, setResultA] = useState<PredictionResult | null>(null);
  const [resultB, setResultB] = useState<PredictionResult | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  const handleSubmitA = async (data: CarFormData) => {
    setLoadingA(true);
    setErrorA(null);
    try {
      const res = await predictPrice(data);
      setResultA(res);
    } catch (err: any) {
      setErrorA(err.message || "Failed to predict price for Car A");
    } finally {
      setLoadingA(false);
    }
  };

  const handleSubmitB = async (data: CarFormData) => {
    setLoadingB(true);
    setErrorB(null);
    try {
      const res = await predictPrice(data);
      setResultB(res);
    } catch (err: any) {
      setErrorB(err.message || "Failed to predict price for Car B");
    } finally {
      setLoadingB(false);
    }
  };

  const delta = React.useMemo(() => {
    if (!resultA || !resultB) return null;
    const diff = resultA.predicted_price - resultB.predicted_price;
    const absDiff = Math.abs(diff);
    const percent = ((absDiff / resultB.predicted_price) * 100).toFixed(1);
    return {
      diff,
      absDiff,
      percent,
      formattedDiff: `₹${absDiff.toLocaleString("en-IN")}`,
      isAHigher: diff > 0,
      isEqual: diff === 0,
    };
  }, [resultA, resultB]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Subnavigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl surface-card">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("benchmarks")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer font-sans ${
              activeTab === "benchmarks"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ML Models Benchmark (8 Algorithms)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vehicles")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer font-sans ${
              activeTab === "vehicles"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Two Vehicles Side by Side</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono-tabular px-3 hidden sm:block">
          Dataset: 7,400 Records • 81 Features
        </span>
      </div>

      {/* Tab 1: ML Models Benchmark Table */}
      {activeTab === "benchmarks" && <ModelBenchmark />}

      {/* Tab 2: Vehicle Comparison Mode */}
      {activeTab === "vehicles" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Delta Banner if both evaluated */}
          {delta && resultA && resultB && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left surface-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  {delta.isAHigher ? <TrendingUp className="w-5 h-5" /> : delta.isEqual ? <Minus className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                    Valuation Differential
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 font-heading">
                    {delta.isEqual
                      ? "Both vehicles have identical ML resale valuations."
                      : delta.isAHigher
                      ? `Car A is valued ${delta.formattedDiff} (+${delta.percent}%) higher than Car B.`
                      : `Car B is valued ${delta.formattedDiff} (+${delta.percent}%) higher than Car A.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono-tabular font-semibold">
                <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  Car A: {resultA.formatted_price}
                </div>
                <span className="text-slate-400 font-sans">vs</span>
                <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  Car B: {resultB.formatted_price}
                </div>
              </div>
            </div>
          )}

          {/* Side-by-side Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Car A Column */}
            <div className="space-y-6">
              <CarForm
                id="car-form-a"
                label="Car A (Reference Vehicle)"
                optionsData={optionsData}
                onSubmit={handleSubmitA}
                isLoading={loadingA}
                initialValues={{
                  make: "maruti",
                  model: "swift",
                  yr_mfr: 2021,
                  kms_run: 28000,
                  fuel_type: "petrol",
                  transmission: "manual",
                  total_owners: 1,
                  car_rating: "great",
                }}
              />
              <ResultCard
                result={resultA}
                isLoading={loadingA}
                error={errorA}
              />
            </div>

            {/* Car B Column */}
            <div className="space-y-6">
              <CarForm
                id="car-form-b"
                label="Car B (Comparison Vehicle)"
                optionsData={optionsData}
                onSubmit={handleSubmitB}
                isLoading={loadingB}
                initialValues={{
                  make: "hyundai",
                  model: "grand i10",
                  yr_mfr: 2018,
                  kms_run: 55000,
                  fuel_type: "petrol",
                  transmission: "manual",
                  total_owners: 2,
                  car_rating: "good",
                }}
              />
              <ResultCard
                result={resultB}
                isLoading={loadingB}
                error={errorB}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
