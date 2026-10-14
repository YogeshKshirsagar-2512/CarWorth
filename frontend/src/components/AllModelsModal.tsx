"use client";

import React, { useState } from "react";
import { ML_MODELS, ModelInfo } from "@/lib/models";
import { 
  X, 
  BarChart3, 
  Check, 
  Award
} from "lucide-react";

interface AllModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModelId: string;
  onSelectModel: (model: ModelInfo) => void;
}

export function AllModelsModal({
  isOpen,
  onClose,
  selectedModelId,
  onSelectModel,
}: AllModelsModalProps) {
  const [sortField, setSortField] = useState<"testR2" | "mae" | "rmse">("testR2");
  const [sortAsc, setSortAsc] = useState(false);

  if (!isOpen) return null;

  const sortedModels = [...ML_MODELS].sort((a, b) => {
    let aVal = 0;
    let bVal = 0;
    if (sortField === "testR2") {
      aVal = parseFloat(a.testR2);
      bVal = parseFloat(b.testR2);
      return sortAsc ? aVal - bVal : bVal - aVal;
    } else if (sortField === "mae") {
      aVal = a.maeVal;
      bVal = b.maeVal;
      return sortAsc ? aVal - bVal : aVal - bVal;
    } else {
      aVal = a.rmseVal;
      bVal = b.rmseVal;
      return sortAsc ? aVal - bVal : aVal - bVal;
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col surface-card bg-white border border-slate-200 shadow-xl animate-in zoom-in-95 duration-200 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                  All 15 Machine Learning Regression Benchmarks
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-tabular bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/80">
                  80/20 Test Split
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal font-sans mt-0.5">
                Ranked evaluation metrics across ~7,400 Indian used car records with 81 engineered dimensions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sorting Controls */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium uppercase text-[11px]">Rank by:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setSortField("testR2");
                  setSortAsc(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                  sortField === "testR2"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                Highest Test R²
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortField("mae");
                  setSortAsc(true);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                  sortField === "mae"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                Lowest MAE
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortField("rmse");
                  setSortAsc(true);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                  sortField === "rmse"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                Lowest RMSE
              </button>
            </div>
          </div>

          <span className="text-slate-500 font-mono-tabular text-xs font-medium hidden sm:block">
            15 Production Algorithms
          </span>
        </div>

        {/* Models Scrollable Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          {sortedModels.map((model, idx) => {
            const isSelected = model.id === selectedModelId;
            const r2Val = parseFloat(model.testR2);
            const barWidth = Math.max(10, Math.round((r2Val / 1.0) * 100));

            return (
              <div
                key={model.id}
                className={`py-3.5 px-3.5 rounded-xl transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-emerald-50/70 border border-emerald-300 shadow-2xs"
                    : "hover:bg-slate-50 border border-transparent hover:border-slate-200/60"
                }`}
              >
                {/* Left: Rank, Name, Category */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="w-8 text-center font-mono-tabular font-medium text-xs text-slate-400 pt-0.5">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-semibold text-sm text-slate-900">
                        {model.name}
                      </span>
                      {model.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {model.badge}
                        </span>
                      )}
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-emerald-600 text-white shadow-2xs">
                          Active Engine
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-normal font-sans mt-0.5 line-clamp-1">
                      {model.description}
                    </p>
                  </div>
                </div>

                {/* Center: Metric Bars & Values */}
                <div className="grid grid-cols-3 gap-3 text-xs font-mono-tabular shrink-0 sm:w-80">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase block font-sans">Test R²</span>
                    <span className="font-bold text-sm text-emerald-600">
                      {model.testR2}
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${model.isRecommended ? "bg-emerald-600" : "bg-slate-400"}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase block font-sans">MAE</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {model.mae}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-medium uppercase block font-sans">RMSE</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {model.rmse}
                    </span>
                  </div>
                </div>

                {/* Right: "Use This Model" Action Button */}
                <div className="shrink-0 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModel(model);
                      onClose();
                    }}
                    className={`w-full sm:w-auto px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer shadow-2xs ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    {isSelected ? "Active Engine" : "Select Engine"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
