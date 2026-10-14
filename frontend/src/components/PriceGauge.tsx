"use client";

import React from "react";

interface PriceGaugeProps {
  price: number;
  mae: number;
  formattedPrice: string;
}

export function PriceGauge({ price, mae, formattedPrice }: PriceGaugeProps) {
  const safePrice = Number(price) || 0;
  const safeMae = typeof mae === "number" && !isNaN(mae) ? mae : parseFloat(String(mae).replace(/[^\d.]/g, "")) || 38500;
  const lowerBound = Math.max(0, safePrice - safeMae);
  const upperBound = safePrice + safeMae;

  const formatNumber = (num: number) => {
    return `₹${Math.round(num).toLocaleString("en-IN")}`;
  };

  return (
    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-sans">
        <span className="font-medium text-slate-700">
          Fair Market Confidence Band (±MAE)
        </span>
        <span className="text-slate-500 font-mono-tabular text-[11px]">
          MAE: ±₹{safeMae.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Visual Track */}
      <div className="relative pt-2 pb-1">
        {/* Track Line */}
        <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden relative">
          <div className="absolute inset-y-0 left-1/4 right-1/4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full" />
        </div>

        {/* Center Marker Pin */}
        <div className="absolute top-0.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-sm" />
        </div>
      </div>

      {/* Range Labels */}
      <div className="flex items-center justify-between text-xs font-mono-tabular pt-0.5">
        <div className="text-left">
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Lower Bound</span>
          <span className="font-semibold text-slate-700 text-xs">
            {formatNumber(lowerBound)}
          </span>
        </div>

        <div className="text-center">
          <span className="text-[10px] text-emerald-600 uppercase font-medium block font-sans">
            Point Estimate
          </span>
          <span className="font-bold text-emerald-700 font-mono-tabular text-xs sm:text-sm">
            {formattedPrice}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Upper Bound</span>
          <span className="font-semibold text-slate-700 text-xs">
            {formatNumber(upperBound)}
          </span>
        </div>
      </div>
    </div>
  );
}
