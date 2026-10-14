"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  BarChart3,
  Award,
  CheckCircle2
} from "lucide-react";

export function ModelCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="surface-card p-6 sm:p-8 transition-all duration-200">
      {/* Header with expand toggle */}
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-slate-50 tracking-tight">
              Model Card & Technical Governance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              XGBoost Regressor • 81 Feature Columns • Test R² = 0.920 • MAE ≈ ±₹38.5k
            </p>
          </div>
        </div>

        <button 
          type="button" 
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
          aria-label={isOpen ? "Collapse model card" : "Expand model card"}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick highlight bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-400 uppercase font-medium block font-sans">Model Architecture</span>
          <span className="font-heading font-bold text-slate-900 dark:text-slate-100">XGBoost Regressor</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-400 uppercase font-medium block font-sans">Test Variance (R²)</span>
          <span className="font-mono-tabular font-bold text-emerald-600 dark:text-emerald-400">R² = 0.9200 (92.0%)</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-400 uppercase font-medium block font-sans">Mean Abs. Error (MAE)</span>
          <span className="font-mono-tabular font-bold text-slate-900 dark:text-slate-100">± ₹38,500</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[10px] text-slate-400 uppercase font-medium block font-sans">Feature Dimensions</span>
          <span className="font-mono-tabular font-bold text-slate-900 dark:text-slate-100">81 Columns</span>
        </div>
      </div>

      {/* Expandable Technical Details */}
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6 text-xs animate-in fade-in duration-200 font-sans">
          {/* Architecture & Pipeline */}
          <div>
            <h4 className="font-heading font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2 text-sm">
              <Layers className="w-4 h-4 text-emerald-600" />
              Machine Learning Pipeline & Encoders
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                <strong>1. Imputation:</strong> Scikit-Learn <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono-tabular">SimpleImputer(strategy="mean")</code> for numerical columns and <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono-tabular">SimpleImputer(strategy="most_frequent")</code> for categorical features.
              </p>
              <p>
                <strong>2. Categorical Encoding:</strong> <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono-tabular">OneHotEncoder(drop="first", handle_unknown="ignore")</code> applied on 14 low-cardinality listing attributes.
              </p>
              <p>
                <strong>3. Continuous Target Encoding:</strong> <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono-tabular">TargetEncoder(cv=5, smooth="auto", random_state=42)</code> applied to high-cardinality <code className="font-mono-tabular">model</code> and <code className="font-mono-tabular">registered_city</code>.
              </p>
              <p>
                <strong>4. Estimator:</strong> <code className="font-mono-tabular">xgb.XGBRegressor(n_estimators=1001, learning_rate=0.03, max_depth=6, subsample=0.8, colsample_bytree=0.8, reg_alpha=10, reg_lambda=1)</code>.
              </p>
            </div>
          </div>

          {/* Known Limitations Alert */}
          <div>
            <h4 className="font-heading font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Known Limitations & Practical Boundaries
            </h4>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 space-y-2 leading-relaxed font-sans">
              <p>
                • <strong>Sample Representativeness:</strong> Trained on approximately 7,400 verified Indian used-car transactions across major metropolitan hubs (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Pune, etc.).
              </p>
              <p>
                • <strong>Rare & Vintage Vehicles:</strong> Resale valuations are statistical estimates and may exhibit higher variance for rare luxury exotics, heavily custom-modified vehicles, or vehicles older than 20 years.
              </p>
              <p>
                • <strong>Under-represented Cities:</strong> Cities or regional RTOs with low listing density in the historical data will rely on smooth empirical Bayes target encodings and state-level regularizers.
              </p>
              <p>
                • <strong>Indicative Range (±8%):</strong> The ±8% bounds reflect model standard residual dispersion on the held-out validation set, not a formal statistical confidence interval.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
