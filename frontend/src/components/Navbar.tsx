"use client";

import React, { useEffect, useState } from "react";
import { 
  Car, 
  Sparkles, 
  GitCompare, 
  ChevronDown, 
  Award, 
  BarChart3, 
  Calculator,
  Menu,
  X,
  ArrowRight
} from "lucide-react";
import { ModelInfo, DEFAULT_MODEL } from "@/lib/models";

interface NavbarProps {
  activeModel?: ModelInfo;
  onOpenCompareModal: () => void;
}

export function Navbar({ activeModel = DEFAULT_MODEL, onOpenCompareModal }: NavbarProps) {
  const [showMetricsPopover, setShowMetricsPopover] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try {
      localStorage.removeItem("carworth-theme");
    } catch (e) {
      // ignore
    }

    const handleScroll = () => {
      const sections = ["overview", "about", "metrics", "predict", "prediction-result"];
      const scrollPos = window.scrollY + 180;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "overview", label: "Overview", href: "#overview" },
    { id: "about", label: "Pipeline", href: "#about" },
    { id: "metrics", label: "Benchmarks", href: "#metrics" },
    { id: "predict", label: "Valuation", href: "#predict" },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 1. Clean Brand Logo (Anchored Left) */}
        <a href="#overview" className="flex items-center gap-2.5 group transition-transform duration-200 shrink-0 z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-2xs group-hover:scale-105 group-hover:rotate-3 transition-transform duration-200">
            <Car className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-[17px] tracking-tight text-slate-900 group-hover:text-emerald-950 transition-colors">
              Car<span className="text-emerald-600">Worth</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
              AI Valuation
            </span>
          </div>
        </a>

        {/* 2. Mathematically Centered Navigation Pill */}
        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 p-1 rounded-full bg-slate-100/70 border border-slate-200/60 text-xs shadow-2xs z-10">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* 3. Right Telemetry & Actions (Anchored Right, Unified h-9 Height) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 z-10">
          {/* Active Model Dropdown Pill */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowMetricsPopover(!showMetricsPopover)}
              className="h-9 flex items-center gap-1.5 px-3 rounded-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 text-xs text-slate-700 transition-all duration-200 cursor-pointer group shadow-2xs whitespace-nowrap"
              aria-label="Toggle model metrics"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-900">{activeModel.shortName}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 text-[10px] font-mono-tabular font-medium">
                R² {activeModel.testR2}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${showMetricsPopover ? "rotate-180" : ""}`} />
            </button>

            {/* Metrics Popover */}
            {showMetricsPopover && (
              <div 
                className="absolute right-0 top-full mt-2 w-76 p-4 surface-card text-xs z-50 animate-in fade-in zoom-in-95 duration-150 shadow-xl bg-white border border-slate-200"
                onMouseLeave={() => setShowMetricsPopover(false)}
              >
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                  <span className="font-heading font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    {activeModel.name}
                  </span>
                  <span className="text-[10px] font-mono-tabular px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                    20% Test Split
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700 mb-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-sans">Variance R²</span>
                    <span className="font-mono-tabular font-bold text-emerald-600 text-sm">{activeModel.testR2}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-sans">Adjusted R²</span>
                    <span className="font-mono-tabular font-bold text-emerald-600 text-sm">{activeModel.adjR2}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-sans">Mean Abs. Error</span>
                    <span className="font-mono-tabular font-semibold text-slate-900 text-sm">{activeModel.mae}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-sans">Root Mean Sq.</span>
                    <span className="font-mono-tabular font-semibold text-slate-900 text-sm">{activeModel.rmse}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowMetricsPopover(false);
                    onOpenCompareModal();
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs text-center transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Compare 15 Algorithms</span>
                </button>
              </div>
            )}
          </div>

          {/* Valuate Car Primary CTA */}
          <a
            href="#predict"
            className="btn-emerald h-9 flex items-center gap-1.5 px-4 rounded-full text-xs font-semibold shadow-2xs cursor-pointer group whitespace-nowrap shrink-0"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Valuate Car</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
          </a>
        </div>

        {/* 4. Mobile / Tablet Menu Button */}
        <div className="flex items-center gap-2 lg:hidden z-10">
          <a
            href="#predict"
            className="sm:hidden btn-emerald h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1 shadow-2xs"
          >
            <Calculator className="w-3 h-3" />
            <span>Valuate</span>
          </a>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-3.5 space-y-2.5 shadow-lg animate-in fade-in duration-200">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </a>
            ))}
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCompareModal();
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Compare 15 Algorithms</span>
            </button>

            <a
              href="#predict"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Start Used Car Valuation</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
