import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient

from backend.app.pipeline import pipeline, format_inr
from backend.app.main import app

client = TestClient(app)

def test_pipeline_on_5_rows_from_csv():
    """
    Runs the inference pipeline on 5 rows from Used_Car_Price_Prediction.csv
    and asserts:
    1. output shape is (5, 81)
    2. feature order matches meta.json exactly
    3. predictions are finite and strictly positive (> 0)
    """
    # Find dataset path
    csv_candidates = [
        Path("Used_Car_Price_Prediction.csv"),
        Path("../Used_Car_Price_Prediction.csv"),
        Path(__file__).resolve().parent.parent.parent / "Used_Car_Price_Prediction.csv"
    ]
    csv_path = None
    for c in csv_candidates:
        if c.exists():
            csv_path = c
            break
            
    assert csv_path is not None, "Used_Car_Price_Prediction.csv not found for unit testing"
    
    df_raw = pd.read_csv(csv_path).head(5)
    
    # Run through pipeline transformation
    transformed_features, _ = pipeline.transform_features(df_raw)
    
    # 1. Assert shape
    assert transformed_features.shape == (5, 81), (
        f"Expected shape (5, 81), but got {transformed_features.shape}"
    )
    
    # 2. Assert exact feature order
    assert list(transformed_features.columns) == pipeline.meta["feature_order"], (
        "Transformed feature order does not match meta.json exact feature_order"
    )
    
    # 3. Assert predictions are finite and positive
    raw_preds = pipeline.xgb_model.predict(transformed_features)
    assert len(raw_preds) == 5
    assert np.all(np.isfinite(raw_preds)), "Predictions must all be finite numbers"
    assert np.all(raw_preds > 0), "Predictions must all be strictly positive"
    
    # Also test single row predict()
    first_row_dict = df_raw.iloc[0].to_dict()
    res = pipeline.predict(first_row_dict)
    assert res["predicted_price"] > 0
    assert "₹" in res["formatted_price"]
    assert res["lower_range"] < res["predicted_price"] < res["upper_range"]
    assert res["indicative_range_label"] == "indicative range, not a statistical confidence interval"

def test_format_inr():
    """Validates Indian numbering system formatting."""
    assert format_inr(412000) == "₹4,12,000"
    assert format_inr(1550000) == "₹15,50,000"
    assert format_inr(50000) == "₹50,000"
    assert format_inr(950) == "₹950"
    assert format_inr(10000000) == "₹1,00,00,000"

def test_health_endpoint():
    """Tests GET /health returns 200 with model info."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert data["model_type"] == "XGBRegressor"
    assert data["features_count"] == 81
    assert data["test_r2"] >= 0.90

def test_options_endpoint():
    """Tests GET /options returns options and lookup maps."""
    response = client.get("/options")
    assert response.status_code == 200
    data = response.json()
    assert "options" in data
    assert "make_to_models" in data
    assert "defaults" in data
    assert "maruti" in data["make_to_models"]
    assert "swift" in data["make_to_models"]["maruti"]

def test_predict_endpoint_valid():
    """Tests POST /predict with valid car payload."""
    payload = {
        "make": "maruti",
        "model": "swift",
        "yr_mfr": 2018,
        "kms_run": 45000,
        "fuel_type": "petrol",
        "transmission": "manual",
        "body_type": "hatchback",
        "total_owners": 1,
        "city": "new delhi",
        "registered_state": "delhi",
        "registered_city": "delhi",
        "car_rating": "great"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_price" in data
    assert data["predicted_price"] > 0
    assert "₹" in data["formatted_price"]
    assert data["lower_range"] < data["predicted_price"] < data["upper_range"]
    assert "indicative range, not a statistical confidence interval" in data["indicative_range_label"]

def test_predict_validation_errors():
    """Tests POST /predict returns 422 for invalid inputs."""
    # Out of range year
    bad_payload = {
        "make": "maruti",
        "model": "swift",
        "yr_mfr": 1980,  # Below 1995
        "kms_run": 45000,
        "fuel_type": "petrol",
        "transmission": "manual",
        "body_type": "hatchback",
        "total_owners": 1,
        "city": "delhi",
        "registered_state": "delhi",
        "registered_city": "delhi",
        "car_rating": "great"
    }
    res = client.post("/predict", json=bad_payload)
    assert res.status_code == 422

    # Negative kms
    bad_payload["yr_mfr"] = 2018
    bad_payload["kms_run"] = -500
    res = client.post("/predict", json=bad_payload)
    assert res.status_code == 422

    # Invalid total owners
    bad_payload["kms_run"] = 45000
    bad_payload["total_owners"] = 10
    res = client.post("/predict", json=bad_payload)
    assert res.status_code == 422

    # Invalid categorical value
    bad_payload["total_owners"] = 1
    bad_payload["fuel_type"] = "rocket_fuel"
    res = client.post("/predict", json=bad_payload)
    assert res.status_code == 422
