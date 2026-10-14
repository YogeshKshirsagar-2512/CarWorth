import logging
from contextlib import asynccontextmanager
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import CORS_ORIGINS
from .schemas import CarPredictRequest, CarPredictResponse, OptionsResponse, HealthResponse, CURRENT_YEAR
from .pipeline import pipeline

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}'
)
logger = logging.getLogger("carworth.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure artifacts are loaded
    logger.info("Initializing CarWorth backend and verifying ML model artifacts...")
    if not pipeline.is_loaded:
        logger.error("ML model failed to load during startup.")
    else:
        logger.info(
            f"CarWorth ML pipeline initialized successfully. "
            f"Features: {len(pipeline.meta.get('feature_order', []))}, Test R²: {pipeline.meta.get('test_r2', 0.92):.4f}"
        )
    yield
    logger.info("Shutting down CarWorth backend...")

app = FastAPI(
    title="CarWorth API",
    description="Production ML service for predicting used car resale prices in India (INR) using XGBoost.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if "*" not in CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        msg = err.get("msg", "Validation error")
        error_messages.append(f"{loc}: {msg}")
    
    logger.warning(f"Validation failure on {request.url.path}: {error_messages}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": error_messages,
            "error_type": "ValidationError",
            "message": "Input car parameters failed validation. Please check the provided values."
        }
    )

@app.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Returns the operational status of the service and model loading state."""
    if not pipeline.is_loaded or pipeline.xgb_model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Model artifacts are not loaded or corrupted."
        )
    return HealthResponse(
        status="ok",
        model_loaded=pipeline.is_loaded,
        model_type="XGBRegressor",
        test_r2=pipeline.meta.get("test_r2", 0.92447),
        features_count=len(pipeline.meta.get("feature_order", []))
    )

@app.get("/options", response_model=OptionsResponse)
def get_options() -> OptionsResponse:
    """Returns dropdown options, make-to-models lookup, and default listing values."""
    if not pipeline.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Metadata options are unavailable."
        )
    return OptionsResponse(
        options=pipeline.meta.get("options", {}),
        make_to_models=pipeline.meta.get("make_to_models", {}),
        defaults=pipeline.meta.get("defaults", {}),
        limits={
            "yr_mfr_min": 1995,
            "yr_mfr_max": CURRENT_YEAR,
            "kms_run_min": 0,
            "kms_run_max": 500000,
            "total_owners_min": 1,
            "total_owners_max": 6
        }
    )

@app.post("/predict", response_model=CarPredictResponse)
def predict_price(request: CarPredictRequest) -> CarPredictResponse:
    """
    Predicts the resale price (in INR) strictly via xgb_model.predict().
    Returns rounded price, ±8% indicative range, and formatted currency strings.
    No request payload or personal data is persisted.
    """
    if not pipeline.is_loaded:
        logger.error("Predict called while pipeline is not loaded.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Predictive model is offline or failed to load."
        )

    try:
        input_data = request.model_dump()
        result = pipeline.predict(input_data)
        logger.info(
            f"Prediction generated successfully for {request.make} {request.model} ({request.yr_mfr}): "
            f"{result['formatted_price']}"
        )
        return CarPredictResponse(**result)
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline error: {str(e)}"
        )
