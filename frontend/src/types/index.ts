export interface CarFormData {
  // Selected ML Model
  model_id?: string;

  // Primary attributes
  make: string;
  model: string;
  yr_mfr: number;
  kms_run: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  total_owners: number;
  city: string;
  registered_state: string;
  registered_city: string;
  car_rating: string;

  // Advanced listing attributes
  assured_buy: boolean;
  fitness_certificate: boolean;
  warranty_avail: boolean;
  source: string;
  car_availability: string;
  times_viewed: number;
  is_hot: boolean;
  reserved: boolean;
}

export interface PredictionResult {
  predicted_price: number;
  formatted_price: string;
  price_lakhs?: string;
  lower_range: number;
  upper_range: number;
  formatted_range: string;
  lower_mae_bound?: number;
  upper_mae_bound?: number;
  formatted_mae_range?: string;
  indicative_range_label: string;
  model_id?: string;
  model_name?: string;
  category?: string;
  test_r2?: number;
  adj_r2?: number;
  mae?: number;
  rmse?: number;
  train_r2?: number;
  input_summary: {
    make: string;
    model: string;
    yr_mfr: number;
    kms_run: number;
    fuel_type: string;
    transmission: string;
    body_type: string;
    total_owners: number;
    city: string;
    registered_state: string;
    registered_city: string;
    car_rating: string;
  };
}

export interface OptionsData {
  options: Record<string, (string | boolean | number)[]>;
  make_to_models: Record<string, string[]>;
  defaults: Record<string, any>;
  limits: {
    yr_mfr_min: number;
    yr_mfr_max: number;
    kms_run_min: number;
    kms_run_max: number;
    total_owners_min: number;
    total_owners_max: number;
  };
}

export interface HealthData {
  status: string;
  model_loaded: boolean;
  model_type: string;
  test_r2: number;
  features_count: number;
}
