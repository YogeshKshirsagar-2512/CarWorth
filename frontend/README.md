# 💻 CarWorth — Frontend Web Application

Modern AI/FinTech SaaS web application for used car valuations built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and Lucide Icons.

---

## ✨ Features

- **FinTech SaaS Aesthetic:** Clean light-mode design with subtle ambient background mesh, vignetted tech micro-grid, and modern typography tokens (`Plus Jakarta Sans`, `Inter`, `JetBrains Mono`).
- **Interactive Valuation Engine:** Comprehensive car attributes input with dependent model dropdowns, fuel/transmission pickers, and expandable advanced parameters.
- **Dynamic 15-Model Leaderboard:** Switch between 15 machine learning models and compare real-time inference telemetry (R², Adjusted R², MAE, RMSE).
- **Celebration Animations:** Smooth odometer count-up for Lakhs shorthand values, interactive range gauges, and celebration fireworks upon prediction.
- **Responsive Navigation:** Centered navigation dock on desktop viewports with a collapsible drawer on mobile and tablet screens.

---

## 📁 Directory Structure

```text
frontend/
├── public/                # Static assets and screenshot previews
├── src/
│   ├── app/
│   │   ├── globals.css    # Typography, ambient animations, and design tokens
│   │   ├── layout.tsx     # Root layout with SEO metadata and atmosphere
│   │   └── page.tsx       # Main page assembling Hero, Pipeline, Benchmarks, and Valuation
│   ├── components/
│   │   ├── AllModelsModal.tsx # Full 15-model benchmark leaderboard modal
│   │   ├── CarForm.tsx        # Dynamic input form with dependent dropdowns
│   │   ├── Fireworks.tsx      # Canvas confetti/fireworks celebration effect
│   │   ├── Footer.tsx         # Responsive modern footer
│   │   ├── ModelSelector.tsx  # Quick switch chip for top regression models
│   │   ├── Navbar.tsx         # Sticky header with telemetry chip and CTA
│   │   └── ResultCard.tsx     # Valuation card with Lakhs shorthand and negotiation brackets
│   ├── lib/
│   │   ├── api.ts             # API client with fallback metadata
│   │   ├── models.ts          # 15 regression models definitions and metrics
│   │   └── meta.json          # Pre-baked fallback options
│   └── types/
│       └── index.ts           # TypeScript interfaces for forms and predictions
├── package.json
└── tsconfig.json
```

---

## 🚀 Quickstart

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm run start
```
