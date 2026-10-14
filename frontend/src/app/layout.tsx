import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarWorth — AI Resale Price Predictor for Used Cars in India",
  description:
    "Predict the resale value (in INR) of used cars in India with high precision using an XGBoost Machine Learning Regressor (Test R² ≈ 0.92, MAE ≈ ₹38.5k).",
  keywords: [
    "CarWorth",
    "car resale price India",
    "used car valuation",
    "XGBoost regressor",
    "car price prediction",
    "machine learning car valuation"
  ],
  authors: [{ name: "CarWorth Engineering" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen app-atmosphere antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
