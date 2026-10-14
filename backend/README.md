# ⚙️ CarWorth — Backend ML Microservice

FastAPI microservice serving real-time inferences for used car valuations using serialized Scikit-Learn pipelines and XGBoost.

---

## 🏗️ Architecture

- **Framework:** FastAPI (Python 3.11+)
- **Inference Engine:** Scikit-Learn + XGBoost (`xgb_model.pkl`)
- **Data Validation:** Pydantic v2 schemas with categorical and range validators
- **Serialization:** Joblib / Pickle
- **Testing:** Pytest test suite asserting matrix shape `(N, 81)`, column alignment, and prediction bounds

---

## 📁 Directory Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── config.py         # CORS origins, artifact directories, environment configuration
│   ├── main.py           # FastAPI application, lifecycle hooks, and REST routes
│   ├── pipeline.py       # Preprocessing pipeline, imputation, target encoding, and inference
│   └── schemas.py        # Pydantic request/response validation models
├── tests/
│   ├── __init__.py
│   └── test_pipeline.py  # Automated unit tests on test fixtures
├── requirements.txt      # Python dependencies
└── README.md             # This documentation
```

---

## 🚀 Quickstart

### 1. Environment Setup

```bash
# From repository root
python -m venv .venv

# Activate on Windows:
.venv\Scripts\activate
# Activate on Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Run the Development Server

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📡 REST API Endpoints

### `GET /health`
Returns system status, active ML model, and feature count.
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_type": "XGBRegressor",
  "test_r2": 0.92,
  "features_count": 81
}
```

### `GET /options`
Returns valid dropdown options for make, model, registered city, fuel type, transmission, body type, etc., populated directly from training metadata.

### `POST /predict`
Evaluates vehicle attributes and returns the predicted resale price, confidence range, and telemetry.

#### Sample Request Body:
```json
{
  "make": "maruti",
  "model": "swift",
  "yr_mfr": 2019,
  "kms_run": 42000,
  "fuel_type": "petrol",
  "transmission": "manual",
  "body_type": "hatchback",
  "total_owners": 1,
  "city": "new delhi",
  "registered_state": "delhi",
  "registered_city": "delhi",
  "car_rating": "great",
  "model_id": "xgboost"
}
```

#### Sample Response Body:
```json
{
  "predicted_price": 542000,
  "currency": "INR",
  "formatted_price": "₹5,42,000",
  "shorthand_price": "₹5.42 Lakh",
  "range_low": 498640,
  "range_high": 585360,
  "formatted_range": "₹4,98,640 – ₹5,85,360",
  "mae": 38500,
  "test_r2": 0.92,
  "model_used": "XGBoost Regressor"
}
```

---

## 🧪 Running Tests

```bash
pytest backend/tests/test_pipeline.py -v
```
