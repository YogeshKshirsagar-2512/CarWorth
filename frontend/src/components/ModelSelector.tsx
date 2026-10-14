"use client";

import React, { useState } from "react";
import { ML_MODELS, ModelInfo } from "@/lib/models";
import { Cpu, Award, AlertTriangle, Check } from "lucide-react";

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (model: ModelInfo) => void;
}

export function ModelSelector({ selectedModelId, onSelectModel }: ModelSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Boosting & Ensemble");

  const categories = [
    "Boosting & Ensemble",
    "Linear & Regularized",
    "Tree & Distance",
  ];

  const filteredModels = ML_MODELS.filter((m) => m.category === activeCategory);
  const currentModel = ML_MODELS.find((m) => m.id === selectedModelId) || ML_MODELS[0];

  return (
    <div className="surface-card p-5 sm:p-6 space-y-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold shadow-2xs">
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-slate-900 tracking-tight">
              Select Machine Learning Engine
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              15 switchable regression algorithms evaluated on 7,400 Indian used car records
            </p>
          </div>
        </div>

        {/* Active Model Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-mono-tabular">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-sans text-slate-600 font-medium">Selected:</span>
          <span className="font-bold text-emerald-800">{currentModel.shortName}</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs font-sans">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all duration-200 cursor-pointer text-center truncate ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Models Grid in Active Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {filteredModels.map((model) => {
          const isSelected = model.id === selectedModelId;

          return (
            <div
              key={model.id}
              onClick={() => onSelectModel(model)}
              className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all duration-200 hover-lift relative flex flex-col justify-between ${
                isSelected
                  ? "bg-emerald-50/70 border-emerald-500/80 ring-2 ring-emerald-500/15 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1.5 mb-1.5">
                  <span className="font-heading font-semibold text-slate-900 text-xs leading-tight">
                    {model.name}
                  </span>
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                  ) : model.isRecommended ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Recommended Model" />
                  ) : null}
                </div>

                {/* Badge if present */}
                {model.badge && (
                  <div className="mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium border ${
                        model.overfittingNotice
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      {model.overfittingNotice ? (
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                      ) : (
                        <Award className="w-2.5 h-2.5 text-emerald-600" />
                      )}
                      {model.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Metrics Row */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-xs font-mono-tabular">
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">Test R²</span>
                  <span className={`font-bold ${isSelected ? "text-emerald-700" : "text-slate-800"}`}>
                    {model.testR2}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-sans block">MAE</span>
                  <span className="font-medium text-slate-600">
                    {model.mae}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
