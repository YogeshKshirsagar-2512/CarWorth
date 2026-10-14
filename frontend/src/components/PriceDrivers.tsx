"use client";

import React from "react";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";

interface Driver {
  feature: string;
  impact: string;
  positive: boolean;
  pct: number;
}

const DRIVERS: Driver[] = [
  { feature: "Car Model Target Encoding", impact: "+83%", positive: true, pct: 83 },
  { feature: "Year of Manufacture", impact: "+52%", positive: true, pct: 52 },
  { feature: "Body Type (SUV / Premium)", impact: "+36%", positive: true, pct: 36 },
  { feature: "Transmission & High Mileage", impact: "-28%", positive: false, pct: 28 },
];

export function PriceDrivers() {
  return (
    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-sans">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5 font-heading">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Key Price Drivers
        </span>
        <span className="text-slate-400 font-mono-tabular text-[11px]">
          EDA Correlation
        </span>
      </div>

      <div className="space-y-2">
        {DRIVERS.map((d) => (
          <div key={d.feature} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-sans text-[11px]">
                {d.feature}
              </span>
              <span
                className={`font-mono-tabular font-semibold text-[11px] flex items-center gap-0.5 ${
                  d.positive ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {d.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {d.impact}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  d.positive ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${d.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
