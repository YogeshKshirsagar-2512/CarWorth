"use client";

import React, { useState, useMemo } from "react";
import { 
  Car, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal, 
  HelpCircle, 
  RotateCcw, 
  Calendar, 
  Gauge, 
  Fuel, 
  Cog, 
  MapPin, 
  Star, 
  Users,
  Sparkles
} from "lucide-react";
import { CarFormData, OptionsData } from "@/types";

interface CarFormProps {
  id?: string;
  label?: string;
  optionsData: OptionsData;
  onSubmit: (data: CarFormData) => Promise<void>;
  isLoading: boolean;
  initialValues?: Partial<CarFormData>;
  selectedModelId?: string;
}

export function CarForm({
  id = "car-form",
  label = "Vehicle Specifications",
  optionsData,
  onSubmit,
  isLoading,
  initialValues,
  selectedModelId = "xgboost",
}: CarFormProps) {
  const currentYear = optionsData.limits?.yr_mfr_max || 2026;

  // Initialize state with defaults
  const [formData, setFormData] = useState<CarFormData>({
    make: initialValues?.make || "maruti",
    model: initialValues?.model || "swift",
    yr_mfr: initialValues?.yr_mfr || 2019,
    kms_run: initialValues?.kms_run || 42000,
    fuel_type: initialValues?.fuel_type || "petrol",
    transmission: initialValues?.transmission || "manual",
    body_type: initialValues?.body_type || "hatchback",
    total_owners: initialValues?.total_owners || 1,
    city: initialValues?.city || "new delhi",
    registered_state: initialValues?.registered_state || "delhi",
    registered_city: initialValues?.registered_city || "delhi",
    car_rating: initialValues?.car_rating || "great",
    // Advanced fields
    assured_buy: initialValues?.assured_buy ?? (optionsData.defaults?.assured_buy ?? true),
    fitness_certificate: initialValues?.fitness_certificate ?? (optionsData.defaults?.fitness_certificate ?? true),
    warranty_avail: initialValues?.warranty_avail ?? (optionsData.defaults?.warranty_avail ?? false),
    source: initialValues?.source || (optionsData.defaults?.source || "inperson_sale"),
    car_availability: initialValues?.car_availability || (optionsData.defaults?.car_availability || "in_stock"),
    times_viewed: initialValues?.times_viewed || (optionsData.defaults?.times_viewed || 1088),
    is_hot: initialValues?.is_hot ?? (optionsData.defaults?.is_hot ?? true),
    reserved: initialValues?.reserved ?? (optionsData.defaults?.reserved ?? false),
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  // Filter models based on selected make
  const availableModels = useMemo(() => {
    const make = formData.make?.toLowerCase().trim();
    if (!make) return [];
    const models = optionsData.make_to_models?.[make] || [];
    if (!modelSearch) return models;
    return models.filter((m) => m.toLowerCase().includes(modelSearch.toLowerCase()));
  }, [formData.make, optionsData.make_to_models, modelSearch]);

  const handleMakeChange = (newMake: string) => {
    const lowerMake = newMake.toLowerCase().trim();
    const modelsForMake = optionsData.make_to_models?.[lowerMake] || [];
    const newModel = modelsForMake.includes(formData.model) ? formData.model : modelsForMake[0] || "";
    setFormData((prev) => ({
      ...prev,
      make: lowerMake,
      model: newModel,
    }));
    setModelSearch("");
  };

  const handleResetAdvanced = () => {
    setFormData((prev) => ({
      ...prev,
      assured_buy: optionsData.defaults?.assured_buy ?? true,
      fitness_certificate: optionsData.defaults?.fitness_certificate ?? true,
      warranty_avail: optionsData.defaults?.warranty_avail ?? false,
      source: optionsData.defaults?.source || "inperson_sale",
      car_availability: optionsData.defaults?.car_availability || "in_stock",
      times_viewed: optionsData.defaults?.times_viewed || 1088,
      is_hot: optionsData.defaults?.is_hot ?? true,
      reserved: optionsData.defaults?.reserved ?? false,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      model_id: selectedModelId || "xgboost",
    });
  };

  const capitalize = (str: string) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className="surface-card p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-xs transition-all duration-200"
    >
      {/* Clean Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-medium text-sm shadow-2xs">
            <Car className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-base text-slate-900 tracking-tight">
              {label}
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Provide vehicle specs to calculate real-time resale price
            </p>
          </div>
        </div>
        <span className="text-xs font-mono-tabular font-medium px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
          INR (₹) India
        </span>
      </div>

      <div className="space-y-4 font-sans">
        {/* Make and Model Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Make */}
          <div>
            <label
              htmlFor={`${id}-make`}
              className="block text-xs font-medium text-slate-700 mb-1.5 font-sans"
            >
              Manufacturer (Make) <span className="text-emerald-600">*</span>
            </label>
            <div className="relative">
              <select
                id={`${id}-make`}
                value={formData.make}
                onChange={(e) => handleMakeChange(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium text-sm focus:outline-none focus:ring-3 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all duration-200 cursor-pointer capitalize font-sans shadow-2xs hover:border-slate-300"
                required
              >
                {optionsData.options?.make?.map((m) => (
                  <option key={String(m)} value={String(m)}>
                    {capitalize(String(m))}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model (Dependent dropdown) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={`${id}-model`}
                className="block text-xs font-medium text-slate-700 font-sans"
              >
                Car Model <span className="text-emerald-600">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-normal font-sans">
                Filtered by {capitalize(formData.make)}
              </span>
            </div>
            <div className="relative">
              <select
                id={`${id}-model`}
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium text-sm focus:outline-none focus:ring-3 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all duration-200 cursor-pointer capitalize font-sans shadow-2xs hover:border-slate-300"
                required
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {capitalize(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Year of Manufacture & Kilometres Driven */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Year */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={`${id}-yr-mfr`}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 font-sans"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Year of Manufacture <span className="text-emerald-600">*</span>
              </label>
              <span className="text-xs text-slate-400 font-mono-tabular">
                1995–{currentYear}
              </span>
            </div>
            <input
              type="number"
              id={`${id}-yr-mfr`}
              min={1995}
              max={currentYear}
              value={formData.yr_mfr}
              onChange={(e) => setFormData({ ...formData, yr_mfr: parseInt(e.target.value) || 2019 })}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium text-sm focus:outline-none focus:ring-3 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all duration-200 font-mono-tabular shadow-2xs hover:border-slate-300"
              required
            />
            {/* Quick chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap font-mono-tabular">
              {[2023, 2021, 2019, 2017, 2015].map((y) => (
                <button
                  type="button"
                  key={y}
                  onClick={() => setFormData({ ...formData, yr_mfr: y })}
                  className={`text-xs px-2.5 py-0.5 rounded-lg border transition-all duration-200 cursor-pointer hover-lift font-medium ${
                    formData.yr_mfr === y
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Kilometres Driven */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={`${id}-kms-run`}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 font-sans"
              >
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                Kilometres Driven <span className="text-emerald-600">*</span>
              </label>
              <span className="text-xs text-slate-600 font-mono-tabular font-medium">
                {formData.kms_run?.toLocaleString("en-IN")} km
              </span>
            </div>
            <input
              type="number"
              id={`${id}-kms-run`}
              min={0}
              max={500000}
              step={500}
              value={formData.kms_run}
              onChange={(e) => setFormData({ ...formData, kms_run: parseFloat(e.target.value) || 0 })}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium text-sm focus:outline-none focus:ring-3 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all duration-200 font-mono-tabular shadow-2xs hover:border-slate-300"
              required
            />
            {/* Quick chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap font-mono-tabular">
              {[20000, 40000, 60000, 80000, 100000].map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setFormData({ ...formData, kms_run: k })}
                  className={`text-xs px-2.5 py-0.5 rounded-lg border transition-all duration-200 cursor-pointer hover-lift font-medium ${
                    formData.kms_run === k
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {k / 1000}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transmission & Fuel Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Transmission */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5 font-sans">
              <Cog className="w-3.5 h-3.5 text-slate-400" />
              Transmission <span className="text-emerald-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["manual", "automatic"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setFormData({ ...formData, transmission: t })}
                  className={`h-11 px-3 rounded-xl border text-xs font-medium capitalize transition-all duration-200 cursor-pointer font-sans shadow-2xs ${
                    formData.transmission === t
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/15 font-semibold"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label
              htmlFor={`${id}-fuel-type`}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5 font-sans"
            >
              <Fuel className="w-3.5 h-3.5 text-slate-400" />
              Fuel Type <span className="text-emerald-600">*</span>
            </label>
            <select
              id={`${id}-fuel-type`}
              value={formData.fuel_type}
              onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium text-sm focus:outline-none focus:ring-3 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all duration-200 cursor-pointer capitalize font-sans shadow-2xs hover:border-slate-300"
              required
            >
              {optionsData.options?.fuel_type?.map((f) => (
                <option key={String(f)} value={String(f)}>
                  {capitalize(String(f))}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Body Type & Number of Owners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Body Type */}
          <div>
            <label
              htmlFor={`${id}-body-type`}
              className="block text-xs font-medium text-slate-700 mb-1.5 font-sans"
            >
              Body Type <span className="text-emerald-600">*</span>
            </label>
            <select
              id={`${id}-body-type`}
              value={formData.body_type}
              onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
              className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium text-sm focus:outline-none focus:ring-3 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all duration-200 cursor-pointer capitalize font-sans shadow-2xs hover:border-slate-300"
              required
            >
              {optionsData.options?.body_type?.map((b) => (
                <option key={String(b)} value={String(b)}>
                  {capitalize(String(b))}
                </option>
              ))}
            </select>
          </div>

          {/* Number of Owners */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5 font-sans">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Previous Owners <span className="text-emerald-600">*</span>
            </label>
            <div className="grid grid-cols-6 gap-1.5 font-mono-tabular">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setFormData({ ...formData, total_owners: num })}
                  className={`h-11 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer shadow-2xs ${
                    formData.total_owners === num
                      ? "bg-emerald-600 border-emerald-600 text-white font-semibold"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  aria-label={`${num} owner${num > 1 ? "s" : ""}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location Row: City, Registered State, Registered City */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Current City */}
          <div>
            <label
              htmlFor={`${id}-city`}
              className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1.5 font-sans"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Listing City <span className="text-emerald-600">*</span>
            </label>
            <select
              id={`${id}-city`}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-3 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all duration-200 cursor-pointer capitalize font-sans shadow-2xs hover:border-slate-300"
              required
            >
              {optionsData.options?.city?.map((c) => (
                <option key={String(c)} value={String(c)}>
                  {capitalize(String(c))}
                </option>
              ))}
            </select>
          </div>

          {/* Registered State */}
          <div>
            <label
              htmlFor={`${id}-reg-state`}
              className="block text-xs font-medium text-slate-700 mb-1.5 font-sans"
            >
              Registered State <span className="text-emerald-600">*</span>
            </label>
            <select
              id={`${id}-reg-state`}
              value={formData.registered_state}
              onChange={(e) => setFormData({ ...formData, registered_state: e.target.value })}
              className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-3 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all duration-200 cursor-pointer capitalize font-sans shadow-2xs hover:border-slate-300"
              required
            >
              {optionsData.options?.registered_state?.map((s) => (
                <option key={String(s)} value={String(s)}>
                  {capitalize(String(s))}
                </option>
              ))}
            </select>
          </div>

          {/* Registered City */}
          <div>
            <label
              htmlFor={`${id}-reg-city`}
              className="block text-xs font-medium text-slate-700 mb-1.5 font-sans"
            >
              Registered City (RTO) <span className="text-emerald-600">*</span>
            </label>
            <select
              id={`${id}-reg-city`}
              value={formData.registered_city}
              onChange={(e) => setFormData({ ...formData, registered_city: e.target.value })}
              className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-3 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all duration-200 cursor-pointer capitalize font-sans shadow-2xs hover:border-slate-300"
              required
            >
              {optionsData.options?.registered_city?.map((rc) => (
                <option key={String(rc)} value={String(rc)}>
                  {capitalize(String(rc))}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Condition Rating */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5 font-sans">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            Car Condition Rating <span className="text-emerald-600">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {optionsData.options?.car_rating?.map((r) => {
              const ratingStr = String(r);
              const isSelected = formData.car_rating === ratingStr;
              return (
                <button
                  type="button"
                  key={ratingStr}
                  onClick={() => setFormData({ ...formData, car_rating: ratingStr })}
                  className={`h-11 px-3 rounded-xl border text-xs font-medium capitalize transition-all duration-200 cursor-pointer font-sans shadow-2xs ${
                    isSelected
                      ? "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/20 font-semibold"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {capitalize(ratingStr)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Advanced Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors py-1 cursor-pointer font-sans"
              aria-expanded={isAdvancedOpen}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Advanced Listing Attributes</span>
              {isAdvancedOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Tooltip trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Info about advanced listing attributes"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute right-0 bottom-full mb-2 w-72 p-3.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 z-30 animate-in fade-in">
                  <p className="font-heading font-semibold text-emerald-400 mb-1">Listing Attributes</p>
                  <p className="text-slate-300 leading-relaxed text-[11px] font-sans">
                    These are marketplace listing features utilized during model training. Pre-filled defaults match typical inventory averages and will produce accurate valuations without modification.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Collapsible Content */}
          {isAdvancedOpen && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-[11px] text-slate-500 font-sans">
                  Defaults are automatically sent to the ML inference engine
                </span>
                <button
                  type="button"
                  onClick={handleResetAdvanced}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer font-sans transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore defaults</span>
                </button>
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer shadow-2xs hover:border-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.assured_buy}
                    onChange={(e) => setFormData({ ...formData, assured_buy: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 font-medium font-sans">Assured Buy</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer shadow-2xs hover:border-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.fitness_certificate}
                    onChange={(e) => setFormData({ ...formData, fitness_certificate: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 font-medium font-sans">Fitness Cert.</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer shadow-2xs hover:border-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.warranty_avail}
                    onChange={(e) => setFormData({ ...formData, warranty_avail: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 font-medium font-sans">Warranty</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer shadow-2xs hover:border-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_hot}
                    onChange={(e) => setFormData({ ...formData, is_hot: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 font-medium font-sans">Hot Listing</span>
                </label>
              </div>

              {/* Second row of advanced attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1 font-sans">
                    Listing Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 capitalize font-sans shadow-2xs"
                  >
                    {optionsData.options?.source?.map((s) => (
                      <option key={String(s)} value={String(s)}>
                        {capitalize(String(s))}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1 font-sans">
                    Availability
                  </label>
                  <select
                    value={formData.car_availability}
                    onChange={(e) => setFormData({ ...formData, car_availability: e.target.value })}
                    className="w-full h-9 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 capitalize font-sans shadow-2xs"
                  >
                    {optionsData.options?.car_availability?.map((ca) => (
                      <option key={String(ca)} value={String(ca)}>
                        {capitalize(String(ca))}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1 font-sans">
                    Times Viewed
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.times_viewed}
                    onChange={(e) => setFormData({ ...formData, times_viewed: parseInt(e.target.value) || 1088 })}
                    className="w-full h-9 px-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-medium font-mono-tabular shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clean Submit button with smooth hover effect */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm tracking-wide shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-sans mt-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="font-mono-tabular font-medium text-xs">Evaluating Regression Pipeline...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Predict Fair Resale Price in INR (₹)</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
