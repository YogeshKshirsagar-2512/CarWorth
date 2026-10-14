"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { CarForm } from "@/components/CarForm";
import { ResultCard } from "@/components/ResultCard";
import { ModelSelector } from "@/components/ModelSelector";
import { AllModelsModal } from "@/components/AllModelsModal";
import { Fireworks } from "@/components/Fireworks";
import { Footer } from "@/components/Footer";
import { CarFormData, PredictionResult, OptionsData } from "@/types";
import { fetchOptions, predictPrice, fallbackOptions } from "@/lib/api";
import { DEFAULT_MODEL, ModelInfo, ML_MODELS } from "@/lib/models";
import {
  Car,
  Sparkles,
  Database,
  Layers,
  Cpu,
  ArrowRight,
  ArrowDown,
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  Gauge,
  Zap,
  Target,
  Brain,
  ShieldCheck,
  Calculator,
  Compass,
  FileText,
  BadgeCheck,
  HelpCircle,
} from "lucide-react";

/* ────────────────────────────────────────────────────────
   Intersection Observer Hook — fade-in sections on scroll
   ──────────────────────────────────────────────────────── */
function useRevealOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, isVisible };
}

/* ════════════════════════════════════════════════════════
   State-of-the-Art Website Atmospheric Background Effect
   - Ambient Gradient Mesh (Emerald, Teal & Cyan luminous orbs)
   - Vignetted Tech Micro-Grid (crisp modern tech texture)
   - Dynamic Floating Light Flares & Horizon Beams
   ════════════════════════════════════════════════════════ */
function WebsiteBackgroundEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Vignetted Tech Micro-Grid Pattern (Fades softly before card content) */}
      <div className="absolute inset-0 bg-tech-grid opacity-60" />

      {/* 2. Top Horizon Glow Beam beneath Header */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      {/* 3. Luminous Floating Mesh Gradient Spheres */}
      {/* Center Emerald Ambient Core */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] h-[480px] rounded-full bg-gradient-to-b from-emerald-500/15 via-teal-500/8 to-transparent blur-[100px] animate-pulse-glow" />

      {/* Floating Teal Flare (Top Right) */}
      <div className="absolute top-10 right-[8%] w-[420px] h-[420px] rounded-full bg-teal-400/12 blur-[90px] animate-float-slow" />

      {/* Floating Emerald Flare (Top Left) */}
      <div className="absolute top-28 left-[6%] w-[380px] h-[380px] rounded-full bg-emerald-500/10 blur-[85px] animate-float-reverse" />

      {/* Mid-Page Cyan Accent Glow (Near benchmarks & valuation engine) */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full bg-cyan-400/5 blur-[120px] animate-pulse-glow" />

      {/* Bottom Emerald Flare */}
      <div className="absolute -bottom-24 right-1/4 w-[550px] h-[300px] rounded-full bg-emerald-500/7 blur-[110px]" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   Main Page Component
   ════════════════════════════════════════════════════════ */
export default function Home() {
  const [optionsData, setOptionsData] = useState<OptionsData>(fallbackOptions);
  const [selectedModel, setSelectedModel] = useState<ModelInfo>(DEFAULT_MODEL);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmittedData, setLastSubmittedData] = useState<CarFormData | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);

  // Reveal hooks for each major section
  const aboutSection = useRevealOnScroll();
  const metricsSection = useRevealOnScroll();
  const predictSection = useRevealOnScroll();
  const resultSection = useRevealOnScroll();

  useEffect(() => {
    fetchOptions().then(setOptionsData);
  }, []);

  /* ── Handlers ───────────────────────────────────── */
  const handlePredict = async (data: CarFormData) => {
    setIsLoading(true);
    setError(null);
    setLastSubmittedData(data);
    setShowFireworks(false);

    // Smooth scroll down to the expanded prediction result card
    setTimeout(() => {
      document.getElementById("prediction-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);

    try {
      const res = await predictPrice({ ...data, model_id: data.model_id || selectedModel.id });
      setResult(res);
      // Trigger Celebration Fireworks! 🎆
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 4000);
    } catch (err: any) {
      setError(err.message || "Prediction failed — check backend on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = async (model: ModelInfo) => {
    setSelectedModel(model);
    if (lastSubmittedData) {
      setIsLoading(true);
      setError(null);
      try {
        const res = await predictPrice({ ...lastSubmittedData, model_id: model.id });
        setResult(res);
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 3500);
      } catch (err: any) {
        setError(err.message || "Model switch failed.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRetry = () => {
    if (lastSubmittedData) handlePredict({ ...lastSubmittedData, model_id: selectedModel.id });
  };

  // Quick Preset Sample Cars for Instant 1-Click Testing
  const quickTestCars = [
    {
      label: "Maruti Swift (2019)",
      badge: "Hatchback",
      data: {
        make: "maruti",
        model: "swift",
        yr_mfr: 2019,
        kms_run: 42000,
        fuel_type: "petrol",
        transmission: "manual",
        body_type: "hatchback",
        total_owners: 1,
        city: "new delhi",
        registered_state: "delhi",
        registered_city: "delhi",
        car_rating: "great",
        assured_buy: true,
        fitness_certificate: true,
        warranty_avail: false,
        source: "in transit",
        car_availability: "in stock",
        times_viewed: 240,
        is_hot: true,
        reserved: false,
      },
    },
    {
      label: "Hyundai Creta (2021)",
      badge: "Popular SUV",
      data: {
        make: "hyundai",
        model: "creta",
        yr_mfr: 2021,
        kms_run: 35000,
        fuel_type: "diesel",
        transmission: "manual",
        body_type: "suv",
        total_owners: 1,
        city: "mumbai",
        registered_state: "maharashtra",
        registered_city: "mumbai",
        car_rating: "great",
        assured_buy: true,
        fitness_certificate: true,
        warranty_avail: true,
        source: "in transit",
        car_availability: "in stock",
        times_viewed: 520,
        is_hot: true,
        reserved: false,
      },
    },
    {
      label: "Honda City (2018)",
      badge: "Premium Sedan",
      data: {
        make: "honda",
        model: "city",
        yr_mfr: 2018,
        kms_run: 55000,
        fuel_type: "petrol",
        transmission: "automatic",
        body_type: "sedan",
        total_owners: 2,
        city: "bengaluru",
        registered_state: "karnataka",
        registered_city: "bangalore",
        car_rating: "good",
        assured_buy: true,
        fitness_certificate: true,
        warranty_avail: false,
        source: "in transit",
        car_availability: "in stock",
        times_viewed: 180,
        is_hot: false,
        reserved: false,
      },
    },
  ];

  const topModels = ML_MODELS.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {/* 🌌 State-of-the-Art Dynamic Website Background Effect */}
      <WebsiteBackgroundEffect />

      {/* 🎆 Fireworks Canvas Celebration Overlay */}
      <Fireworks trigger={showFireworks} durationMs={3500} />

      {/* ╔═══════ Sticky Header / Navbar ═══════╗ */}
      <Navbar
        activeModel={selectedModel}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
      />

      {/* ╔══════════════════════════════════════════════
          SECTION 1 — HERO / HOME SCREEN
          ══════════════════════════════════════════════╗ */}
      <section id="overview" className="relative overflow-hidden pt-12 sm:pt-16 pb-20 sm:pb-24">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Eyebrow Header Badge - Clean & Refined */}
          <div className="animate-reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/90 text-emerald-800 text-xs font-medium border border-emerald-200/80 shadow-2xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Gauge className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI-Powered Used Car Valuation Engine • India</span>
          </div>

          {/* Main H1 Heading - Clean Modern SaaS */}
          <h1 className="animate-reveal delay-100 font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-slate-900 tracking-[-0.03em] leading-[1.14]">
            Find Out Your Car&apos;s{" "}
            <br className="hidden sm:inline" />
            <span className="text-gradient-emerald">True Resale Worth</span>
          </h1>

          {/* Subtitle - Clean & Balanced */}
          <p className="animate-reveal delay-200 text-base sm:text-lg text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed font-sans">
            Don&apos;t rely on dealer guesswork. CarWorth uses a trained <span className="text-slate-900 font-medium">XGBoost ML model</span> to evaluate <span className="text-slate-900 font-medium">81 vehicle attributes</span> across <span className="text-slate-900 font-medium">7,400+ real market sales</span> to calculate the exact fair cash price of any used car in India.
          </p>

          {/* Primary CTA Buttons - Smooth Hover Effects */}
          <div className="animate-reveal delay-300 pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#predict"
              className="btn-emerald inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm shadow-xs cursor-pointer group"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate Car Value Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 text-slate-700 font-medium text-sm transition-all duration-200 shadow-2xs hover:-translate-y-0.5 cursor-pointer"
            >
              <span>How It Works (3 Steps)</span>
              <ArrowDown className="w-4 h-4 text-emerald-600" />
            </a>
          </div>

          {/* 3-STEP INTUITIVE VISUAL WORKFLOW BANNER - Clean & Light */}
          <div className="animate-reveal delay-300 pt-4 max-w-3xl mx-auto">
            <div className="surface-card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-left mb-3 flex items-center justify-between">
                <span className="text-xs font-heading font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>How CarWorth Works in 3 Quick Steps:</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono-tabular font-medium">100% Free • No Sign-up</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                {/* Step 1 */}
                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-xs text-slate-900">Enter Specs</h4>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5">
                      Year, make, model, km run, city, fuel & transmission.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-semibold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-xs text-slate-900">AI Analyzes 81 Features</h4>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5">
                      Bayesian target encoding with XGBoost pipeline.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-semibold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-xs text-slate-900">Instant Valuation (INR)</h4>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5">
                      Fair cash price, ±8% range & negotiation brackets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Test Vehicles Chips */}
          <div className="animate-reveal delay-400 pt-1 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500 text-xs font-medium">Try Sample Cars:</span>
            {quickTestCars.map((car) => (
              <button
                key={car.label}
                type="button"
                onClick={() => handlePredict(car.data)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50/80 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 transition-all duration-200 shadow-2xs hover:-translate-y-0.5 cursor-pointer font-medium text-xs"
              >
                <Car className="w-3.5 h-3.5 text-emerald-600" />
                <span>{car.label}</span>
                <span className="text-[11px] text-slate-400 font-mono-tabular">({car.badge})</span>
              </button>
            ))}
          </div>

          {/* Trust KPIs Strip - Clean & Subtle */}
          <div className="animate-reveal delay-500 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="surface-card p-4 text-left hover-lift flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="font-mono-tabular font-bold text-slate-900 text-lg">7,400+</div>
                <div className="text-[11px] text-slate-500 font-medium">Verified Car Sales</div>
              </div>
            </div>

            <div className="surface-card p-4 text-left hover-lift flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="font-mono-tabular font-bold text-slate-900 text-lg">81 Features</div>
                <div className="text-[11px] text-slate-500 font-medium">Encoded Dimensions</div>
              </div>
            </div>

            <div className="surface-card p-4 text-left hover-lift flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="font-mono-tabular font-bold text-emerald-600 text-lg">R² = 0.920</div>
                <div className="text-[11px] text-slate-500 font-medium">Test Explanatory Power</div>
              </div>
            </div>

            <div className="surface-card p-4 text-left hover-lift flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="font-mono-tabular font-bold text-slate-900 text-lg">13 Models</div>
                <div className="text-[11px] text-slate-500 font-medium">Switchable Regressors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════
          SECTION 2 — ABOUT THE PROJECT & PIPELINE
          ══════════════════════════════════════════════╗ */}
      <section id="about" className="py-20 scroll-mt-20 relative" ref={aboutSection.ref}>
        <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${aboutSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <div className="section-divider mb-4" />
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/80 mb-3">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>END-TO-END PIPELINE ARCHITECTURE</span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              How CarWorth Evaluates Your Vehicle
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Our production ML pipeline rigorously replicates our research notebook inference — running full imputation, continuous target encoding, and gradient boosting.
            </p>
          </div>

          {/* 4 Pipeline Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Database className="w-4 h-4" />, step: "01", title: "Market Ingestion", desc: "Your vehicle's mileage, registration city, make, and year are matched against 7,400+ authentic Indian sales." },
              { icon: <Layers className="w-4 h-4" />, step: "02", title: "81 Feature Encoders", desc: "Mean & mode imputation, 14 one-hot variables, and 5-fold cross-validated Bayesian target encodings on model and city." },
              { icon: <Brain className="w-4 h-4" />, step: "03", title: "XGBoost Estimator", desc: "Inference through an ensemble of 1,001 boosted trees with depth-6 regularization, learning_rate=0.03, and L1/L2 penalties." },
              { icon: <Target className="w-4 h-4" />, step: "04", title: "Fair Price Bounds", desc: "Calculates the central price point plus a dual confidence bracket (±MAE and ±8% residual dispersion) for confident negotiations." },
            ].map((item) => (
              <div key={item.step} className="surface-card p-5 hover-lift group relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-xs transition-all duration-200">
                <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:text-emerald-700 transition-all duration-200">
                  {item.icon}
                </div>
                <div className="text-[11px] font-mono-tabular font-semibold text-emerald-600 uppercase mb-1">Step {item.step}</div>
                <h3 className="font-heading font-semibold text-sm text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Tech Stack Pills */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-2 text-xs">
            <span className="text-slate-500 text-xs font-medium mr-1">Engineering Stack:</span>
            {["Python 3.11", "XGBoost 2.1", "scikit-learn", "FastAPI", "Next.js 16 (App Router)", "TypeScript", "Tailwind CSS"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-white text-slate-600 font-medium border border-slate-200 text-xs hover:border-slate-300 transition-colors">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════
          SECTION 3 — EVALUATION METRICS DASHBOARD
          ══════════════════════════════════════════════╗ */}
      <section id="metrics" className="py-20 bg-slate-50/60 scroll-mt-20 border-y border-slate-200/70 relative" ref={metricsSection.ref}>
        <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${metricsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <div className="section-divider mb-4" />
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/80 mb-3">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>TEST SET VALIDATION TELEMETRY</span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Rigorous Model Benchmarks
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Every algorithm is independently evaluated on an identical 20% holdout split across 7,400 Indian used car records.
            </p>
          </div>

          {/* Primary Model Highlight Card */}
          <div className="surface-card p-6 sm:p-7 mb-6 relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading font-bold text-lg text-slate-900">XGBoost Regressor</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Top Benchmark Winner</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono-tabular mt-0.5">1001 estimators · max_depth=6 · learning_rate=0.03 · reg_alpha=10 · reg_lambda=1</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Test R² Score", value: "0.9200", sub: "92.0% variance explained", accent: true },
                { label: "Adjusted R²", value: "0.9154", sub: "Penalized for 81 features", accent: true },
                { label: "Mean Absolute Error", value: "± ₹38,500", sub: "Average prediction error", accent: false },
                { label: "Root Mean Sq. Error", value: "₹74,200", sub: "Penalizes large residuals", accent: false },
              ].map((m) => (
                <div key={m.label} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                  <span className="text-[11px] text-slate-500 uppercase font-medium block font-sans">{m.label}</span>
                  <div className={`font-mono-tabular font-bold text-xl mt-1 ${m.accent ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {m.value}
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal font-sans mt-0.5 block">{m.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Models Comparison Table */}
          <div className="surface-card overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Algorithm Performance Leaderboard
              </h3>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
              >
                <span>View all 15 algorithms</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {topModels.map((model, idx) => {
                const r2 = parseFloat(model.testR2);
                const barW = Math.round(r2 * 100);
                return (
                  <div key={model.id} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50/70 transition-colors duration-150">
                    <span className="w-6 text-center font-mono-tabular text-xs text-slate-400">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-heading font-semibold text-sm text-slate-800">{model.name}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 w-48">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <div className={`h-full rounded-full ${idx === 0 ? 'bg-emerald-600' : 'bg-slate-400'}`} style={{ width: `${barW}%` }} />
                      </div>
                    </div>
                    <span className="font-mono-tabular font-bold text-sm text-emerald-600 w-16 text-right">{model.testR2}</span>
                    <span className="font-mono-tabular text-xs text-slate-500 w-24 text-right hidden sm:block">{model.mae}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════
          SECTION 4 — PREDICTION INTERFACE (FORM & MODEL SELECTOR)
          ══════════════════════════════════════════════╗ */}
      <section id="predict" className="py-20 scroll-mt-20 relative" ref={predictSection.ref}>
        <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${predictSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-10">
            <div className="section-divider mb-4" />
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/80 mb-3">
              <Car className="w-3.5 h-3.5" />
              <span>INTERACTIVE VEHICLE VALUATION</span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Enter Your Vehicle Details
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Select your preferred machine learning engine and provide your car&apos;s attributes below.
            </p>
          </div>

          {/* Model Selector Bar */}
          <div className="mb-8">
            <ModelSelector
              selectedModelId={selectedModel.id}
              onSelectModel={handleModelChange}
            />
          </div>

          {/* Car Specs Form */}
          <div className="w-full">
            <CarForm
              optionsData={optionsData}
              onSubmit={handlePredict}
              isLoading={isLoading}
              selectedModelId={selectedModel.id}
            />
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════
          SECTION 5 — FINAL PREDICTION RESULT
          ══════════════════════════════════════════════╗ */}
      <section
        id="prediction-result"
        className="py-16 bg-slate-50/60 scroll-mt-20 border-t border-slate-200/70 relative"
        ref={resultSection.ref}
      >
        <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${resultSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-8">
            <div className="section-divider mb-4" />
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/80 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FINAL MACHINE LEARNING VALUATION</span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Predicted Fair Market Valuation
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
              Computed in real-time by your selected machine learning model artifact with ±MAE confidence bounds.
            </p>
          </div>

          {/* EXPANDED PREDICTION BOX */}
          <div className="w-full">
            <ResultCard
              result={result}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
              activeModel={selectedModel}
              onTriggerFireworks={() => {
                setShowFireworks(true);
                setTimeout(() => setShowFireworks(false), 3500);
              }}
            />
          </div>
        </div>
      </section>

      {/* All-Models Comparison Modal */}
      <AllModelsModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        selectedModelId={selectedModel.id}
        onSelectModel={handleModelChange}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
