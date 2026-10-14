"use client";

import React, { useState } from "react";
import { Award, BarChart3, CheckCircle2, ChevronRight, Gauge, Info, TrendingUp, Zap } from "lucide-react";

export interface BenchmarkModel {
  name: string;
  category: string;
  trainR2: string;
  testR2: string;
  adjR2: string;
  mae: string;
  rmse: string;
  isWinner?: boolean;
  notes: string;
}

export const BENCHMARK_MODELS: BenchmarkModel[] = [
  {
    name: "XGBoost Regressor",
    category: "Gradient Boosted Trees",
    trainR2: "0.9927",
    testR2: "0.9200",
    adjR2: "0.9154",
    mae: "₹38,500",
    rmse: "₹74,200",
    isWinner: true,
    notes: "Active deployed model • 1001 trees • Minimum MAE & RMSE across Indian car dataset",
  },
  {
    name: "Random Forest Regressor",
    category: "Ensemble Bagging",
    trainR2: "0.9811",
    testR2: "0.8977",
    adjR2: "0.8918",
    mae: "₹45,370",
    rmse: "₹84,391",
    notes: "101 estimators, min_samples_split=20",
  },
  {
    name: "Gradient Boosting",
    category: "Sequential Boosting",
    trainR2: "0.9186",
    testR2: "0.8858",
    adjR2: "0.8792",
    mae: "₹53,450",
    rmse: "₹89,177",
    notes: "learning_rate=0.1, n_estimators=500",
  },
  {
    name: "RidgeCV (cv=10)",
    category: "L2 Regularized Linear",
    trainR2: "0.8328",
    testR2: "0.8521",
    adjR2: "0.8435",
    mae: "₹68,322",
    rmse: "₹1,01,477",
    notes: "10-fold cross validation with optimal alpha",
  },
  {
    name: "Linear Regression",
    category: "OLS Linear Baseline",
    trainR2: "0.8330",
    testR2: "0.8516",
    adjR2: "0.8430",
    mae: "₹68,367",
    rmse: "₹1,01,647",
    notes: "Ordinary least squares baseline",
  },
  {
    name: "Decision Tree",
    category: "Single Tree",
    trainR2: "1.0000",
    testR2: "0.7979",
    adjR2: "0.7862",
    mae: "₹64,509",
    rmse: "₹1,18,620",
    notes: "Overfits training set (R²=1.00), lower generalization",
  },
  {
    name: "KNN Regressor (k=31)",
    category: "Distance-based Instance",
    trainR2: "0.7470",
    testR2: "0.7568",
    adjR2: "0.7427",
    mae: "₹84,885",
    rmse: "₹1,30,103",
    notes: "GridSearchCV optimal k=31 on scaled manifold",
  },
  {
    name: "LassoCV / ElasticNetCV",
    category: "L1 / Elastic Penalization",
    trainR2: "0.7151",
    testR2: "0.7448",
    adjR2: "0.7300",
    mae: "₹88,343",
    rmse: "₹1,33,279",
    notes: "Heavy sparsity penalty eliminates key non-linear interactions",
  },
];

export function ModelBenchmark() {
  const [metricFilter, setMetricFilter] = useState<"testR2" | "mae" | "rmse">("testR2");

  return (
    <div className="surface-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-sans">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              Machine Learning Benchmarks
            </span>
            <span className="text-xs text-slate-400 font-mono-tabular">
              ~7,400 Car Dataset (80/20 Split)
            </span>
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-slate-50 tracking-tight mt-1">
            Regression Model Comparison & Evaluation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Validation benchmarks evaluated under identical cross-validation conditions (<code className="font-mono-tabular text-emerald-600 dark:text-emerald-400">random_state=42</code>).
          </p>
        </div>

        {/* Metric Sorting / Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-sans">
          <button
            type="button"
            onClick={() => setMetricFilter("testR2")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              metricFilter === "testR2"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            R² Score
          </button>
          <button
            type="button"
            onClick={() => setMetricFilter("mae")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              metricFilter === "mae"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Lowest MAE
          </button>
          <button
            type="button"
            onClick={() => setMetricFilter("rmse")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              metricFilter === "rmse"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Lowest RMSE
          </button>
        </div>
      </div>

      {/* Benchmark Table */}
      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-heading">
              <th className="py-3 px-4">Algorithm / Model</th>
              <th className="py-3 px-3 font-mono-tabular">Train R²</th>
              <th className="py-3 px-3 font-mono-tabular">Test R²</th>
              <th className="py-3 px-3 font-mono-tabular">Adj. R²</th>
              <th className="py-3 px-3 font-mono-tabular">MAE (INR)</th>
              <th className="py-3 px-3 font-mono-tabular">RMSE (INR)</th>
              <th className="py-3 px-4">Status / Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {BENCHMARK_MODELS.map((model) => {
              const testVal = parseFloat(model.testR2);
              const barWidth = Math.round((testVal / 1.0) * 100);

              return (
                <tr
                  key={model.name}
                  className={`transition-colors ${
                    model.isWinner
                      ? "bg-emerald-500/5 dark:bg-emerald-500/10 font-medium"
                      : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {/* Model Name & Category */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {model.isWinner && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      )}
                      <div>
                        <div className="font-heading font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{model.name}</span>
                          {model.isWinner && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tabular bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-300/40">
                              Production Model
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-sans">
                          {model.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Train R2 */}
                  <td className="py-3.5 px-3 font-mono-tabular text-slate-600 dark:text-slate-300">
                    {model.trainR2}
                  </td>

                  {/* Test R2 with visual mini bar */}
                  <td className="py-3.5 px-3 font-mono-tabular">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${model.isWinner ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"}`}>
                        {model.testR2}
                      </span>
                      <div className="w-14 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${model.isWinner ? "bg-emerald-500" : "bg-slate-400"}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Adj R2 */}
                  <td className="py-3.5 px-3 font-mono-tabular text-slate-600 dark:text-slate-300">
                    {model.adjR2}
                  </td>

                  {/* MAE */}
                  <td className="py-3.5 px-3 font-mono-tabular text-slate-900 dark:text-slate-100 font-semibold">
                    {model.mae}
                  </td>

                  {/* RMSE */}
                  <td className="py-3.5 px-3 font-mono-tabular text-slate-600 dark:text-slate-300">
                    {model.rmse}
                  </td>

                  {/* Notes / Status */}
                  <td className="py-3.5 px-4 text-[11px] text-slate-500 dark:text-slate-400">
                    {model.notes}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Technical Footnote */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-sans">
          <strong>Evaluation Methodology:</strong> All models were trained on 80% (N≈5,920) of verified Indian used car transaction data and evaluated strictly on the 20% held-out test split (N≈1,480) with 81 continuous, one-hot, and target-encoded features. XGBoost achieved the lowest MAE (₹38.5k) and lowest residual standard deviation (RMSE ₹74.2k), validating its selection as our production inference engine.
        </p>
      </div>
    </div>
  );
}
