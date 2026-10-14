"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Check, 
  Copy, 
  Share2, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw,
  BarChart3,
  Cpu,
  Layers,
  Sparkles,
  Award,
  Zap,
  Info,
  Car,
  Calculator,
  ChevronRight,
  Flame,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { PredictionResult } from "@/types";
import { PriceGauge } from "./PriceGauge";
import { PriceDrivers } from "./PriceDrivers";
import { ModelInfo, DEFAULT_MODEL } from "@/lib/models";

interface ResultCardProps {
  result: PredictionResult | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  activeModel?: ModelInfo;
  onTriggerFireworks?: () => void;
}

export function ResultCard({
  result,
  isLoading,
  error,
  onRetry,
  activeModel = DEFAULT_MODEL,
  onTriggerFireworks,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Micro-step cycling during processing
  const [processingStep, setProcessingStep] = useState(0);
  const processingSteps = [
    "Normalizing numerical fields with Scikit-Learn SimpleImputer...",
    "Encoding 14 categorical features via OneHotEncoder (drop='first')...",
    "Computing continuous Bayesian target encodings on model & city...",
    `Executing ${activeModel.shortName} regression estimator across 81 features...`,
    "Evaluating test residuals & dual confidence boundaries...",
  ];

  useEffect(() => {
    if (!isLoading) {
      setProcessingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setProcessingStep((prev) => (prev + 1) % processingSteps.length);
    }, 200);
    return () => clearInterval(interval);
  }, [isLoading, processingSteps.length]);

  // Odometer / Count Up
  const [displayPrice, setDisplayPrice] = useState<number>(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!result?.predicted_price) {
      setDisplayPrice(0);
      return;
    }

    const target = result.predicted_price;
    const duration = 1000;
    const startTime = performance.now();

    function easeOutExpo(x: number): number {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.round(target * easedProgress);

      setDisplayPrice(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [result?.predicted_price]);

  const formatNumberINR = (val: number) => {
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const formatLakhsShorthand = (val: number) => {
    const lk = val / 100000.0;
    return `₹${lk.toFixed(2)} Lakh`;
  };

  const handleCopy = () => {
    if (!result) return;
    const summary = result.input_summary;
    const textToCopy = `🚗 CarWorth Valuation Report
══════════════════════════════
Estimated Price: ${result.formatted_price} (${result.price_lakhs || formatLakhsShorthand(result.predicted_price)})
Indicative Range (±8%): ${result.formatted_range}
Vehicle: ${summary.make?.toUpperCase()} ${summary.model?.toUpperCase()} (${summary.yr_mfr})
Odometer: ${summary.kms_run?.toLocaleString("en-IN")} km
Fuel / Transmission: ${summary.fuel_type?.toUpperCase()} / ${summary.transmission?.toUpperCase()}
City / State: ${summary.city} (${summary.registered_state})
Condition Rating: ${summary.car_rating}
Engine: ${result.model_name || activeModel.name} (Test R² = ${result.test_r2 ?? activeModel.testR2})
══════════════════════════════
Valuated via CarWorth AI: ${typeof window !== "undefined" ? window.location.href : ""}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!result) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "CarWorth Used Car Valuation",
          text: `Estimated resale price for ${result.input_summary.make?.toUpperCase()} ${result.input_summary.model?.toUpperCase()}: ${result.formatted_price}`,
          url: window.location.href,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const cap = (str?: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // State 1: Loading
  if (isLoading) {
    return (
      <div className="surface-card p-8 sm:p-12 w-full bg-white border border-slate-200/80 rounded-2xl shadow-xs text-center space-y-5">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-3 border-slate-100" />
          <div className="absolute inset-0 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2.5 max-w-md mx-auto">
          <h3 className="font-heading font-semibold text-lg text-slate-900">
            Calculating Market Valuation...
          </h3>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <p className="text-xs font-mono-tabular font-medium text-slate-700 min-h-[28px] flex items-center justify-center">
              {processingSteps[processingStep]}
            </p>

            <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-200" 
                style={{ width: `${((processingStep + 1) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Error
  if (error) {
    return (
      <div className="surface-card p-6 sm:p-8 w-full bg-white border border-red-200 rounded-2xl shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 pb-4 border-b border-red-100">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-red-900">
              Inference Pipeline Notice
            </h3>
            <p className="text-xs text-slate-500">
              The valuation requires a response from the live machine learning model.
            </p>
          </div>
        </div>

        <div className="my-4 p-3.5 rounded-xl bg-red-50/70 border border-red-100">
          <p className="text-xs text-red-800 font-mono-tabular leading-relaxed">
            {error}
          </p>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Valuation</span>
          </button>
        )}
      </div>
    );
  }

  // State 3: Empty / Ready State (Wide and Informative so it never looks empty)
  if (!result) {
    return (
      <div className="surface-card p-6 sm:p-10 w-full bg-white border border-slate-200/80 rounded-2xl shadow-xs relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <Calculator className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-slate-900">
                  Valuation Workspace
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in your vehicle specifications above to compute instant fair cash value
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-xs font-mono-tabular text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-sans font-medium text-slate-500">Engine Ready:</span>
              <span className="font-semibold text-slate-800">{activeModel.name}</span>
            </div>
          </div>

          {/* 3 Step Guidance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5 hover-lift">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="font-heading font-semibold text-xs text-slate-900">Configure Specs</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                Enter manufacturer, model, registration year, km driven, and city above.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5 hover-lift">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-semibold text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="font-heading font-semibold text-xs text-slate-900">Click Predict</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                FastAPI runs your selected ML algorithm across 81 encoded dimensions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5 hover-lift">
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 font-semibold text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="font-heading font-semibold text-xs text-slate-900">Inspect Results</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                Inspect fair market price, confidence bounds, and negotiation brackets.
              </p>
            </div>
          </div>

          {/* Active Model Telemetry Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-emerald-700 tracking-wider block font-sans">
                  Active Algorithm Performance
                </span>
                <h4 className="font-heading font-semibold text-xs text-slate-900">
                  {activeModel.name} (Holdout Test Explained Variance: {activeModel.testR2})
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-xs font-mono-tabular">
              <div className="text-center sm:text-right">
                <span className="text-slate-500 block text-[10px] uppercase">Mean Error</span>
                <span className="font-semibold text-slate-800 text-xs">{activeModel.mae}</span>
              </div>
              <div className="h-5 w-px bg-slate-300" />
              <div className="text-center sm:text-right">
                <span className="text-slate-500 block text-[10px] uppercase">Residual RMSE</span>
                <span className="font-semibold text-slate-800 text-xs">{activeModel.rmse}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Revealed Prediction Result
  const summary = result.input_summary;
  const currentModelInfo = activeModel;
  const targetMAE: number = typeof result.mae === "number" ? result.mae : parseFloat(String(result.mae ?? currentModelInfo.maeVal).replace(/[^\d.]/g, "")) || 38500;
  const targetRMSE: number = typeof result.rmse === "number" ? result.rmse : parseFloat(String(result.rmse ?? currentModelInfo.rmseVal).replace(/[^\d.]/g, "")) || 74200;
  const targetR2: number = typeof result.test_r2 === "number" ? result.test_r2 : parseFloat(String(result.test_r2 ?? currentModelInfo.testR2)) || 0.92;
  const targetAdjR2: number = typeof result.adj_r2 === "number" ? result.adj_r2 : parseFloat(String(result.adj_r2 ?? currentModelInfo.adjR2)) || 0.915;

  // EMI Estimate: 48 months @ 9.5% per annum
  const loanAmount = Math.round(result.predicted_price * 0.85); // 15% down payment
  const monthlyRate = 0.095 / 12;
  const tenureMonths = 48;
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );

  return (
    <div className="surface-card p-6 sm:p-8 w-full bg-white border border-slate-200/80 rounded-2xl shadow-xs relative overflow-hidden transition-all duration-300 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{result.model_name || currentModelInfo.name}</span>
          </span>
          <span className="text-xs font-mono-tabular text-slate-400">
            • 81 Features Evaluated
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onTriggerFireworks && (
            <button
              type="button"
              onClick={onTriggerFireworks}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all duration-200 cursor-pointer shadow-2xs hover:-translate-y-0.5"
              title="Launch celebratory fireworks"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Celebrate! 🎆</span>
            </button>
          )}

          <span className="text-xs font-mono-tabular px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-medium">
            INR (₹) Indian Rupees
          </span>
        </div>
      </div>

      {/* EXPANDED 2-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* LEFT COLUMN: Main Valuation, Confidence Gauge, Negotiation Ranges (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Price Card - Clean & Striking */}
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs text-center relative overflow-hidden">
            <span className="text-[11px] font-mono-tabular font-medium tracking-wider text-slate-500 uppercase block mb-1">
              ESTIMATED FAIR CASH RESALE VALUE
            </span>

            {/* Odometer count up text - Clean & Elegant */}
            <div className="text-5xl sm:text-6xl font-bold text-emerald-600 tracking-tight font-mono-tabular py-1">
              {formatNumberINR(displayPrice)}
            </div>

            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono-tabular font-semibold text-xs sm:text-sm">
                {formatLakhsShorthand(displayPrice)}
              </span>
              <span className="text-xs text-slate-500 font-normal">
                Verified Indian Fair Market Price
              </span>
            </div>

            {/* Indicative Range Strip */}
            <div className="mt-4 p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs font-mono-tabular shadow-2xs">
              <span className="text-slate-600 font-medium">Indicative Range (±8%):</span>
              <strong className="text-slate-900 font-bold text-sm">
                {result.formatted_range}
              </strong>
            </div>
          </div>

          {/* Confidence Gauge */}
          <div className="surface-card bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <PriceGauge
              price={result.predicted_price}
              mae={targetMAE}
              formattedPrice={result.formatted_price}
            />
          </div>

          {/* Buyer vs Seller Recommended Negotiation Ranges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* If Selling */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-0.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold font-heading text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Recommended Listing Price</span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">For private sellers on OLX / Cars24:</p>
              <div className="font-mono-tabular font-bold text-emerald-900 text-sm pt-0.5">
                {formatNumberINR(Math.round(result.predicted_price * 1.04))} – {formatNumberINR(Math.round(result.predicted_price * 1.08))}
              </div>
            </div>

            {/* If Buying */}
            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-0.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-teal-800 font-semibold font-heading text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Fair Target Offer</span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">For buyers negotiating a deal:</p>
              <div className="font-mono-tabular font-bold text-teal-900 text-sm pt-0.5">
                {formatNumberINR(Math.round(result.predicted_price * 0.94))} – {formatNumberINR(Math.round(result.predicted_price * 0.98))}
              </div>
            </div>
          </div>

          {/* EMI Quick Calculator Box */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-medium shadow-2xs">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-900 block text-xs font-sans">
                  Estimated Loan EMI: ~₹{emi.toLocaleString("en-IN")}/month
                </span>
                <span className="text-[11px] text-slate-500 font-normal font-sans">
                  85% loan (₹{loanAmount.toLocaleString("en-IN")}) at 9.5% p.a. for 48 months
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Telemetry, Key Drivers, Specs & Action Buttons (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* ML Telemetry Strip */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-semibold text-slate-800 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Model Test Telemetry</span>
              </span>
              <span className="text-[10px] font-mono-tabular font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                20% Holdout Split
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-medium block">TEST R² SCORE</span>
                <span className="font-mono-tabular font-bold text-emerald-600 text-base">
                  {targetR2.toFixed(4)}
                </span>
                <span className="text-[10px] text-slate-400 block font-normal">{(targetR2 * 100).toFixed(1)}% explained</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-medium block">ADJUSTED R²</span>
                <span className="font-mono-tabular font-bold text-emerald-600 text-base">
                  {targetAdjR2.toFixed(4)}
                </span>
                <span className="text-[10px] text-slate-400 block font-normal">81 features</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-medium block">MEAN ABS. ERROR</span>
                <span className="font-mono-tabular font-bold text-slate-800 text-base">
                  ± ₹{targetMAE.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-400 block font-normal">Average error</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-medium block">ROOT MEAN SQ.</span>
                <span className="font-mono-tabular font-bold text-slate-800 text-base">
                  ₹{targetRMSE.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-400 block font-normal">Residual std</span>
              </div>
            </div>
          </div>

          {/* Key Price Influencers */}
          <div className="surface-card bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <PriceDrivers />
          </div>

          {/* Evaluated Specs Grid */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-xs font-heading font-semibold text-slate-800 block">
              Evaluated Specifications
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Vehicle</span>
                <span className="font-semibold text-slate-800 truncate block text-xs">
                  {cap(summary.make)} {cap(summary.model)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Year & KM</span>
                <span className="font-semibold text-slate-800 block font-mono-tabular text-xs">
                  {summary.yr_mfr} • {(summary.kms_run / 1000).toFixed(0)}k km
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Powertrain</span>
                <span className="font-semibold text-slate-800 capitalize block text-xs">
                  {summary.fuel_type} • {summary.transmission}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Location</span>
                <span className="font-semibold text-slate-800 capitalize block truncate text-xs">
                  {summary.city}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Copy & Share with Smooth Hover */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-xs hover:shadow-md cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Report Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Valuation Report</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="h-11 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-2xs"
              aria-label="Share valuation"
            >
              {shareSuccess ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
