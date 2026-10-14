import json
import os
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, TargetEncoder
import xgboost as xgb

os.makedirs("artifacts", exist_ok=True)

df_raw = pd.read_csv("Used_Car_Price_Prediction.csv")
car = df_raw.drop(columns=[
    "emi_starts_from", "booking_down_pymnt", "broker_quote",
    "rto", "variant", "ad_created_on", "car_name", "original_price"
])

numerical_cols = list(car.select_dtypes(include=["number"]).columns)
categorical_cols = list(car.select_dtypes(include=["object", "bool"]).columns)

numerical_imputer = SimpleImputer(strategy="mean")
car[numerical_cols] = numerical_imputer.fit_transform(car[numerical_cols])

categorical_imputer = SimpleImputer(strategy="most_frequent")
car[categorical_cols] = categorical_imputer.fit_transform(car[categorical_cols])

OneHot_cols = [
    "fuel_type", "transmission", "body_type", "city",
    "registered_state", "source", "car_availability",
    "car_rating", "make", "assured_buy", "is_hot",
    "fitness_certificate", "reserved", "warranty_avail"
]

onehot_encoder = OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore")
encoded = onehot_encoder.fit_transform(car[OneHot_cols])
onehot_encode_cols = list(onehot_encoder.get_feature_names_out(OneHot_cols))
encoded_car = pd.DataFrame(encoded, columns=onehot_encode_cols, index=car.index)
car = pd.concat((car.drop(columns=OneHot_cols), encoded_car), axis=1)

Target_cols = ["registered_city", "model"]
target_encoder = TargetEncoder(smooth="auto", cv=5, target_type="continuous", random_state=42)
encoded_values = target_encoder.fit_transform(car[Target_cols], car["sale_price"])
Target_encode_cols = list(target_encoder.get_feature_names_out(Target_cols))
encoded_target_car = pd.DataFrame(encoded_values, columns=Target_encode_cols, index=car.index)
car = pd.concat([car.drop(columns=Target_cols), encoded_target_car], axis=1)

X = car.drop(columns=["sale_price"])
y = car["sale_price"]

feature_order = list(X.columns)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

xgb_model = xgb.XGBRegressor(
    n_estimators=1001,
    learning_rate=0.03,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=10,
    reg_lambda=1,
    random_state=42,
    n_jobs=-1
)
xgb_model.fit(X_train, y_train)

train_r2 = r2_score(y_train, xgb_model.predict(X_train))
test_r2 = r2_score(y_test, xgb_model.predict(X_test))
print(f"Artifact Model Training R2: {train_r2:.6f}")
print(f"Artifact Model Testing R2: {test_r2:.6f}")

# Extract options
options = {}
for col in categorical_cols:
    vals = df_raw[col].dropna().unique()
    # Normalize bool or str
    if df_raw[col].dtype == bool or any(isinstance(v, bool) for v in vals):
        options[col] = [True, False]
    else:
        options[col] = sorted(list(set(str(v).strip().lower() for v in vals if pd.notna(v))))

# Make to models map
make_to_models = {}
for make_val in sorted(df_raw['make'].dropna().unique()):
    make_clean = str(make_val).strip().lower()
    models = sorted(df_raw[df_raw['make'] == make_val]['model'].dropna().unique())
    models_clean = sorted(list(set(str(m).strip().lower() for m in models)))
    make_to_models[make_clean] = models_clean

# Sensible defaults
defaults = {
    "assured_buy": True,
    "fitness_certificate": True,
    "warranty_avail": False,
    "source": "inperson_sale",
    "car_availability": "in_stock",
    "times_viewed": 1088,
    "is_hot": True,
    "reserved": False,
    "car_rating": "great"
}

meta = {
    "numerical_cols": numerical_cols,
    "categorical_cols": categorical_cols,
    "onehot_cols": OneHot_cols,
    "target_cols": Target_cols,
    "feature_order": feature_order,
    "options": options,
    "make_to_models": make_to_models,
    "defaults": defaults,
    "test_r2": float(test_r2),
    "train_r2": float(train_r2)
}

with open("artifacts/numerical_imputer.pkl", "wb") as f:
    pickle.dump(numerical_imputer, f)

with open("artifacts/categorical_imputer.pkl", "wb") as f:
    pickle.dump(categorical_imputer, f)

with open("artifacts/onehot_encoder.pkl", "wb") as f:
    pickle.dump(onehot_encoder, f)

with open("artifacts/target_encoder.pkl", "wb") as f:
    pickle.dump(target_encoder, f)

with open("artifacts/xgb_model.pkl", "wb") as f:
    pickle.dump(xgb_model, f)

with open("artifacts/meta.json", "w", encoding="utf-8") as f:
    json.dump(meta, f, indent=2)

print("Artifacts successfully generated and saved to artifacts/")
