import React from "react";
import { Car, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-slate-300 bg-white py-10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Car className="w-4 h-4" />
          </div>
          <span className="font-heading font-black text-slate-950 text-base">
            CarWorth
          </span>
          <span className="text-slate-700 font-bold">
            © 2026 • AI Automotive Used Car Valuation Platform (India)
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-emerald-800 font-black">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>FastAPI ML Engine Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>100% Privacy Protected • No Personal Data Stored</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
