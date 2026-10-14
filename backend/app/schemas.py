import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, field_validator
from .config import ARTIFACTS_DIR

CURRENT_YEAR = datetime.now().year

# Load meta options for schema validation if available
META_OPTIONS: Dict[str, List[Any]] = {}
try:
    meta_path = ARTIFACTS_DIR / "meta.json"
    if meta_path.exists():
        with open(meta_path, "r", encoding="utf-8") as f:
            meta_data = json.load(f)
            META_OPTIONS = meta_data.get("options", {})
except Exception:
    pass

class CarPredictRequest(BaseModel):
    # Model Selection
    model_id: Optional[str] = Field(default="xgboost", description="Selected ML Algorithm ID")

    # Primary fields
    make: str = Field(..., description="Manufacturer / Brand (e.g. maruti, hyundai)")
    model: str = Field(..., description="Vehicle Model (e.g. swift, grand i10)")
    yr_mfr: int = Field(..., description=f"Year of manufacture (1995 to {CURRENT_YEAR})")
    kms_run: float = Field(..., description="Kilometres driven (0 to 500,000)")
    fuel_type: str = Field(..., description="Fuel type (e.g. petrol, diesel, cng)")
    transmission: str = Field(..., description="Transmission (manual, automatic)")
    body_type: str = Field(..., description="Body style (hatchback, sedan, suv, etc.)")
    total_owners: int = Field(..., description="Number of previous owners (1 to 6)")
    city: str = Field(..., description="Current listing city")
    registered_state: str = Field(..., description="Registration state (e.g. delhi, uttar pradesh)")
    registered_city: str = Field(..., description="Registration RTO city")
    car_rating: str = Field(..., description="Condition rating (great, good, fair, etc.)")

    # Advanced listing attributes with sensible defaults
    assured_buy: Optional[bool] = Field(default=True, description="Assured buy guarantee")
    fitness_certificate: Optional[bool] = Field(default=True, description="Valid fitness certificate")
    warranty_avail: Optional[bool] = Field(default=False, description="Warranty available")
    source: Optional[str] = Field(default="inperson_sale", description="Listing channel/source")
    car_availability: Optional[str] = Field(default="in_stock", description="Stock availability status")
    times_viewed: Optional[int] = Field(default=1088, description="Listing view count on platform")
    is_hot: Optional[bool] = Field(default=True, description="Trending / hot listing flag")
    reserved: Optional[bool] = Field(default=False, description="Car reserved flag")

    @field_validator("yr_mfr")
    @classmethod
    def validate_yr_mfr(cls, v: int) -> int:
        if v < 1995 or v > CURRENT_YEAR:
            raise ValueError(f"Year of manufacture must be between 1995 and {CURRENT_YEAR}. Provided: {v}")
        return v

    @field_validator("kms_run")
    @classmethod
    def validate_kms_run(cls, v: float) -> float:
        if v < 0 or v > 500000:
            raise ValueError(f"Kilometres driven must be between 0 and 500,000 km. Provided: {v}")
        return v

    @field_validator("total_owners")
    @classmethod
    def validate_total_owners(cls, v: int) -> int:
        if v < 1 or v > 6:
            raise ValueError(f"Total owners must be between 1 and 6. Provided: {v}")
        return v

    @field_validator(
        "make", "model", "fuel_type", "transmission", "body_type", 
        "city", "registered_state", "registered_city", "car_rating",
        "source", "car_availability", mode="before"
    )
    @classmethod
    def normalize_and_validate_categorical(cls, v: Any, info) -> str:
        if not isinstance(v, str):
            v = str(v)
        normalized = v.strip().lower()
        field_name = info.field_name
        
        # Validate against options if available
        if META_OPTIONS and field_name in META_OPTIONS:
            valid_options = [str(opt).strip().lower() for opt in META_OPTIONS[field_name]]
            if normalized not in valid_options:
                raise ValueError(
                    f"Invalid value '{v}' for '{field_name}'. "
                    f"Must be one of: {', '.join(valid_options[:10])}{'...' if len(valid_options) > 10 else ''}"
                )
        return normalized

class CarPredictResponse(BaseModel):
    predicted_price: int = Field(..., description="Rounded resale price in INR")
    formatted_price: str = Field(..., description="Indian Rupee formatted price string (e.g. ₹4,12,000)")
    price_lakhs: str = Field(..., description="Shorthand price in Lakhs (e.g. ₹4.12 Lakh)")
    lower_range: int = Field(..., description="Lower indicative price limit (-8%)")
    upper_range: int = Field(..., description="Upper indicative price limit (+8%)")
    formatted_range: str = Field(..., description="Formatted indicative range string")
    lower_mae_bound: int = Field(..., description="Lower bound (Price - MAE)")
    upper_mae_bound: int = Field(..., description="Upper bound (Price + MAE)")
    formatted_mae_range: str = Field(..., description="Formatted MAE range string")
    indicative_range_label: str = Field(
        default="indicative range, not a statistical confidence interval",
        description="Range disclaimer label"
    )
    model_id: str = Field(default="xgboost", description="Active prediction model identifier")
    model_name: str = Field(default="XGBoost Regressor", description="Human readable model name")
    category: str = Field(default="Boosting & Ensemble", description="Algorithm category")
    test_r2: float = Field(default=0.9200, description="Model Test R² score")
    adj_r2: float = Field(default=0.9154, description="Model Adjusted R² score")
    mae: int = Field(default=38500, description="Mean Absolute Error in INR")
    rmse: int = Field(default=74200, description="Root Mean Squared Error in INR")
    train_r2: Optional[float] = Field(default=0.9927, description="Model Train R² score")
    input_summary: Dict[str, Any] = Field(..., description="Summary of parsed vehicle features")

class OptionsResponse(BaseModel):
    options: Dict[str, List[Any]]
    make_to_models: Dict[str, List[str]]
    defaults: Dict[str, Any]
    limits: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_type: str
    test_r2: float
    features_count: int
