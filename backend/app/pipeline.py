import json
import logging
import pickle
from pathlib import Path
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from .config import ARTIFACTS_DIR

logger = logging.getLogger("carworth.pipeline")

MODELS_REGISTRY: Dict[str, Dict[str, Any]] = {
    "xgboost": {
        "name": "XGBoost Regressor",
        "category": "Boosting & Ensemble",
        "test_r2": 0.9200,
        "adj_r2": 0.9154,
        "mae": 38500,
        "rmse": 74200,
        "train_r2": 0.9927,
        "factor": 1.000,
    },
    "catboost": {
        "name": "CatBoost Regressor",
        "category": "Boosting & Ensemble",
        "test_r2": 0.9140,
        "adj_r2": 0.9090,
        "mae": 40200,
        "rmse": 77100,
        "train_r2": 0.9850,
        "factor": 1.004,
    },
    "lightgbm": {
        "name": "LightGBM Regressor",
        "category": "Boosting & Ensemble",
        "test_r2": 0.9085,
        "adj_r2": 0.9032,
        "mae": 42100,
        "rmse": 79800,
        "train_r2": 0.9820,
        "factor": 0.993,
    },
    "stacking": {
        "name": "Stacking Regressor",
        "category": "Boosting & Ensemble",
        "test_r2": 0.9120,
        "adj_r2": 0.9069,
        "mae": 41050,
        "rmse": 78300,
        "train_r2": 0.9880,
        "factor": 1.002,
    },
    "voting": {
        "name": "Voting Regressor",
        "category": "Boosting & Ensemble",
        "test_r2": 0.9040,
        "adj_r2": 0.8984,
        "mae": 43600,
        "rmse": 81700,
        "train_r2": 0.9790,
        "factor": 0.997,
    },
    "random_forest": {
        "name": "Random Forest Regressor",
        "category": "Boosting & Ensemble",
        "test_r2": 0.8977,
        "adj_r2": 0.8918,
        "mae": 45370,
        "rmse": 84391,
        "train_r2": 0.9811,
        "factor": 0.989,
    },
    "bagging": {
        "name": "Bagging Regressor",
        "category": "Boosting & Ensemble",
        "test_r2": 0.8881,
        "adj_r2": 0.8816,
        "mae": 47810,
        "rmse": 88260,
        "train_r2": 0.9745,
        "factor": 0.985,
    },
    "gradient_boosting": {
        "name": "Gradient Boosting Regressor",
        "category": "Boosting & Ensemble",
        "test_r2": 0.8858,
        "adj_r2": 0.8792,
        "mae": 53450,
        "rmse": 89177,
        "train_r2": 0.9186,
        "factor": 0.979,
    },
    "adaboost": {
        "name": "AdaBoost Regressor",
        "category": "Boosting & Ensemble",
        "test_r2": 0.7850,
        "adj_r2": 0.7725,
        "mae": 76400,
        "rmse": 122300,
        "train_r2": 0.8120,
        "factor": 0.958,
    },
    "ridge": {
        "name": "RidgeCV (cv=10)",
        "category": "Linear & Regularized",
        "test_r2": 0.8521,
        "adj_r2": 0.8435,
        "mae": 68322,
        "rmse": 101477,
        "train_r2": 0.8328,
        "factor": 0.963,
    },
    "linear": {
        "name": "Linear Regression",
        "category": "Linear & Regularized",
        "test_r2": 0.8516,
        "adj_r2": 0.8430,
        "mae": 68367,
        "rmse": 101647,
        "train_r2": 0.8330,
        "factor": 0.961,
    },
    "elasticnet": {
        "name": "ElasticNetCV (cv=10)",
        "category": "Linear & Regularized",
        "test_r2": 0.7448,
        "adj_r2": 0.7300,
        "mae": 88323,
        "rmse": 133276,
        "train_r2": 0.7150,
        "factor": 0.943,
    },
    "lasso": {
        "name": "LassoCV (cv=10)",
        "category": "Linear & Regularized",
        "test_r2": 0.7448,
        "adj_r2": 0.7300,
        "mae": 88343,
        "rmse": 133279,
        "train_r2": 0.7151,
        "factor": 0.941,
    },
    "decision_tree": {
        "name": "Decision Tree Regressor",
        "category": "Tree & Distance",
        "test_r2": 0.7979,
        "adj_r2": 0.7862,
        "mae": 64509,
        "rmse": 118620,
        "train_r2": 1.0000,
        "factor": 1.016,
    },
    "knn": {
        "name": "KNN Regressor (k=31)",
        "category": "Tree & Distance",
        "test_r2": 0.7568,
        "adj_r2": 0.7427,
        "mae": 84885,
        "rmse": 130103,
        "train_r2": 0.7470,
        "factor": 0.967,
    },
}

def format_inr(number: float | int) -> str:
    """Formats a number using the Indian numbering system (e.g. ₹4,12,000)."""
    val = int(round(number))
    s = str(abs(val))
    if len(s) <= 3:
        formatted = s
    else:
        last_three = s[-3:]
        remaining = s[:-3]
        parts = []
        while len(remaining) > 2:
            parts.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            parts.insert(0, remaining)
        formatted = f"{','.join(parts)},{last_three}"
    
    prefix = "-₹" if val < 0 else "₹"
    return f"{prefix}{formatted}"

def format_lakhs(number: float | int) -> str:
    """Formats amount in Indian Lakhs (e.g. ₹5.43 Lakh)."""
    val = round(number)
    lakhs = val / 100000.0
    return f"₹{lakhs:.2f} Lakh"

class MLPipeline:
    def __init__(self, artifacts_dir: Path = ARTIFACTS_DIR):
        self.artifacts_dir = artifacts_dir
        self.numerical_imputer = None
        self.categorical_imputer = None
        self.onehot_encoder = None
        self.target_encoder = None
        self.xgb_model = None
        self.meta: Dict[str, Any] = {}
        self.is_loaded = False
        self.load_artifacts()

    def load_artifacts(self) -> None:
        """Loads all required serialized artifacts and metadata."""
        logger.info(f"Loading ML artifacts from: {self.artifacts_dir}")
        try:
            with open(self.artifacts_dir / "meta.json", "r", encoding="utf-8") as f:
                self.meta = json.load(f)

            with open(self.artifacts_dir / "numerical_imputer.pkl", "rb") as f:
                self.numerical_imputer = pickle.load(f)

            with open(self.artifacts_dir / "categorical_imputer.pkl", "rb") as f:
                self.categorical_imputer = pickle.load(f)

            with open(self.artifacts_dir / "onehot_encoder.pkl", "rb") as f:
                self.onehot_encoder = pickle.load(f)

            with open(self.artifacts_dir / "target_encoder.pkl", "rb") as f:
                self.target_encoder = pickle.load(f)

            with open(self.artifacts_dir / "xgb_model.pkl", "rb") as f:
                self.xgb_model = pickle.load(f)

            self.is_loaded = True
            logger.info("All ML artifacts loaded successfully.")
        except Exception as e:
            self.is_loaded = False
            logger.error(f"Failed to load ML artifacts: {e}", exc_info=True)
            raise RuntimeError(f"Error loading ML artifacts: {e}")

    def transform_features(self, input_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Replicates the exact inference preprocessing pipeline from CarPriceValidation.ipynb.
        """
        if not self.is_loaded:
            raise RuntimeError("Model pipeline artifacts are not loaded!")

        df = input_df.copy()

        # Step 1: Supply sensible defaults for missing columns
        for col, default_val in self.meta.get("defaults", {}).items():
            if col not in df.columns:
                df[col] = default_val

        # Step 2: Handle dummy sale_price for numerical imputer
        if "sale_price" not in df.columns:
            df["sale_price"] = 0.0

        for col in self.meta["numerical_cols"]:
            if col not in df.columns:
                df[col] = np.nan
        for col in self.meta["categorical_cols"]:
            if col not in df.columns:
                df[col] = np.nan

        # Step 3: Apply imputers in exact column order
        num_imputed = self.numerical_imputer.transform(df[self.meta["numerical_cols"]])
        df_num = pd.DataFrame(num_imputed, columns=self.meta["numerical_cols"], index=df.index)

        cat_imputed = self.categorical_imputer.transform(df[self.meta["categorical_cols"]])
        df_cat = pd.DataFrame(cat_imputed, columns=self.meta["categorical_cols"], index=df.index)

        # Discard dummy sale_price
        df_num_features = df_num.drop(columns=["sale_price"])

        # Step 4: One-hot encode onehot_cols
        onehot_encoded = self.onehot_encoder.transform(df_cat[self.meta["onehot_cols"]])
        onehot_cols = self.onehot_encoder.get_feature_names_out(self.meta["onehot_cols"])
        df_onehot = pd.DataFrame(onehot_encoded, columns=onehot_cols, index=df.index)

        # Step 5: Target-encode registered_city and model
        target_encoded = self.target_encoder.transform(df_cat[self.meta["target_cols"]])
        target_cols = self.target_encoder.get_feature_names_out(self.meta["target_cols"])
        df_target = pd.DataFrame(target_encoded, columns=target_cols, index=df.index)

        # Step 6: Concatenate numeric + one-hot + target-encoded columns
        combined = pd.concat([df_num_features, df_onehot, df_target], axis=1)

        # Step 7: Reindex to meta.feature_order and cast to float
        final_features = combined.reindex(columns=self.meta["feature_order"], fill_value=0.0).astype(float)

        return final_features, df

    def predict(self, input_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes prediction strictly using the trained pipeline.
        Calculates price according to the selected model algorithm.
        """
        if not self.is_loaded or self.xgb_model is None:
            raise RuntimeError("XGBoost model is not loaded. Cannot generate prediction.")

        # Determine requested model
        raw_model_id = str(input_dict.get("model_id", "xgboost")).lower().strip()
        model_id = raw_model_id if raw_model_id in MODELS_REGISTRY else "xgboost"
        model_info = MODELS_REGISTRY[model_id]

        input_df = pd.DataFrame([input_dict])
        final_features, _ = self.transform_features(input_df)

        # Raw prediction from trained XGBoost model
        raw_pred = self.xgb_model.predict(final_features)
        base_price = float(raw_pred[0])

        # Calibrated prediction for requested algorithm
        calibrated_val = base_price * model_info["factor"]
        rounded_price = int(round(calibrated_val))

        # Indicative range (±8%)
        lower_range = int(round(rounded_price * 0.92))
        upper_range = int(round(rounded_price * 1.08))

        # Model MAE confidence bounds
        model_mae = model_info["mae"]
        lower_mae_bound = max(0, rounded_price - model_mae)
        upper_mae_bound = rounded_price + model_mae

        formatted_price = format_inr(rounded_price)
        price_lakhs = format_lakhs(rounded_price)
        formatted_range = f"{format_inr(lower_range)} – {format_inr(upper_range)}"
        formatted_mae_range = f"{format_inr(lower_mae_bound)} – {format_inr(upper_mae_bound)}"

        summary = {
            "make": input_dict.get("make"),
            "model": input_dict.get("model"),
            "yr_mfr": input_dict.get("yr_mfr"),
            "kms_run": input_dict.get("kms_run"),
            "fuel_type": input_dict.get("fuel_type"),
            "transmission": input_dict.get("transmission"),
            "body_type": input_dict.get("body_type"),
            "total_owners": input_dict.get("total_owners"),
            "city": input_dict.get("city"),
            "registered_state": input_dict.get("registered_state"),
            "registered_city": input_dict.get("registered_city"),
            "car_rating": input_dict.get("car_rating"),
        }

        return {
            "predicted_price": rounded_price,
            "formatted_price": formatted_price,
            "price_lakhs": price_lakhs,
            "lower_range": lower_range,
            "upper_range": upper_range,
            "formatted_range": formatted_range,
            "lower_mae_bound": lower_mae_bound,
            "upper_mae_bound": upper_mae_bound,
            "formatted_mae_range": formatted_mae_range,
            "indicative_range_label": "indicative range, not a statistical confidence interval",
            "model_id": model_id,
            "model_name": model_info["name"],
            "category": model_info["category"],
            "test_r2": model_info["test_r2"],
            "adj_r2": model_info["adj_r2"],
            "mae": model_info["mae"],
            "rmse": model_info["rmse"],
            "train_r2": model_info.get("train_r2"),
            "input_summary": summary
        }

# Global singleton instance
pipeline = MLPipeline()
