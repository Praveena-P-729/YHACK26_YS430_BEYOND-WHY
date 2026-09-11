import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)


# ============================================================
# 1. LOAD CLEAN DATASET
# ============================================================

print("=" * 60)
print("LOADING CLEAN DATASET")
print("=" * 60)

df = pd.read_csv("clean_landslide_dataset.csv")

print("Dataset shape:", df.shape)


# ============================================================
# 2. SEPARATE FEATURES AND TARGET
# ============================================================

X = df.drop(columns=["landslide"])
y = df["landslide"]

print("\nFeatures:", X.shape)
print("Target:", y.shape)


# ============================================================
# 3. IDENTIFY CATEGORICAL AND NUMERICAL FEATURES
# ============================================================

categorical_features = X.select_dtypes(
    include=["object", "string"]
).columns.tolist()

numerical_features = X.select_dtypes(
    include=["int64", "float64"]
).columns.tolist()

print("\nCategorical features:")
print(categorical_features)

print("\nNumber of numerical features:", len(numerical_features))


# ============================================================
# 4. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ============================================================
# 5. PREPROCESSING
# ============================================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "numerical",
            "passthrough",
            numerical_features
        )
    ]
)


# ============================================================
# 6. RANDOM FOREST MODEL
# ============================================================

print("\n" + "=" * 60)
print("TRAINING RANDOM FOREST")
print("=" * 60)

rf_model = RandomForestClassifier(
    n_estimators=300,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

rf_pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", rf_model)
    ]
)

rf_pipeline.fit(X_train, y_train)

rf_probability = rf_pipeline.predict_proba(X_test)[:, 1]

rf_prediction = (rf_probability >= 0.5).astype(int)


# ============================================================
# 7. XGBOOST MODEL
# ============================================================

print("\n" + "=" * 60)
print("TRAINING XGBOOST")
print("=" * 60)

xgb_model = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="binary:logistic",
    eval_metric="logloss",
    random_state=42,
    n_jobs=-1
)

xgb_pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            ColumnTransformer(
                transformers=[
                    (
                        "categorical",
                        OneHotEncoder(handle_unknown="ignore"),
                        categorical_features
                    ),
                    (
                        "numerical",
                        "passthrough",
                        numerical_features
                    )
                ]
            )
        ),
        ("model", xgb_model)
    ]
)

xgb_pipeline.fit(X_train, y_train)

xgb_probability = xgb_pipeline.predict_proba(X_test)[:, 1]

xgb_prediction = (xgb_probability >= 0.5).astype(int)


# ============================================================
# 8. EVALUATION FUNCTION
# ============================================================

def evaluate_model(name, y_true, prediction, probability):

    print("\n" + "=" * 60)
    print(name)
    print("=" * 60)

    accuracy = accuracy_score(y_true, prediction)
    precision = precision_score(y_true, prediction)
    recall = recall_score(y_true, prediction)
    f1 = f1_score(y_true, prediction)
    auc = roc_auc_score(y_true, probability)

    print(f"Accuracy  : {accuracy:.4f}")
    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1 Score  : {f1:.4f}")
    print(f"ROC-AUC   : {auc:.4f}")

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_true, prediction))

    print("\nClassification Report:")
    print(classification_report(y_true, prediction))

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "auc": auc
    }


# ============================================================
# 9. EVALUATE RANDOM FOREST
# ============================================================

rf_results = evaluate_model(
    "RANDOM FOREST",
    y_test,
    rf_prediction,
    rf_probability
)


# ============================================================
# 10. EVALUATE XGBOOST
# ============================================================

xgb_results = evaluate_model(
    "XGBOOST",
    y_test,
    xgb_prediction,
    xgb_probability
)


# ============================================================
# 11. ENSEMBLE MODEL
# ============================================================

print("\n" + "=" * 60)
print("CREATING ENSEMBLE MODEL")
print("=" * 60)

# Equal weighting initially
rf_weight = 0.5
xgb_weight = 0.5

ensemble_probability = (
    rf_weight * rf_probability
    +
    xgb_weight * xgb_probability
)

ensemble_prediction = (
    ensemble_probability >= 0.5
).astype(int)


# ============================================================
# 12. EVALUATE ENSEMBLE
# ============================================================

ensemble_results = evaluate_model(
    "RANDOM FOREST + XGBOOST ENSEMBLE",
    y_test,
    ensemble_prediction,
    ensemble_probability
)


# ============================================================
# 13. MODEL COMPARISON
# ============================================================

print("\n" + "=" * 60)
print("MODEL COMPARISON")
print("=" * 60)

comparison = pd.DataFrame({
    "Model": [
        "Random Forest",
        "XGBoost",
        "Ensemble"
    ],
    "Accuracy": [
        rf_results["accuracy"],
        xgb_results["accuracy"],
        ensemble_results["accuracy"]
    ],
    "Precision": [
        rf_results["precision"],
        xgb_results["precision"],
        ensemble_results["precision"]
    ],
    "Recall": [
        rf_results["recall"],
        xgb_results["recall"],
        ensemble_results["recall"]
    ],
    "F1 Score": [
        rf_results["f1"],
        xgb_results["f1"],
        ensemble_results["f1"]
    ],
    "ROC-AUC": [
        rf_results["auc"],
        xgb_results["auc"],
        ensemble_results["auc"]
    ]
})

print(
    comparison.to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}"
    )
)


# ============================================================
# 14. SAVE MODELS
# ============================================================

print("\n" + "=" * 60)
print("SAVING MODELS")
print("=" * 60)

joblib.dump(
    rf_pipeline,
    "random_forest_landslide.pkl"
)

joblib.dump(
    xgb_pipeline,
    "xgboost_landslide.pkl"
)

# Save ensemble weights
ensemble_config = {
    "rf_weight": rf_weight,
    "xgb_weight": xgb_weight
}

joblib.dump(
    ensemble_config,
    "ensemble_config.pkl"
)

print("Random Forest saved:")
print("random_forest_landslide.pkl")

print("\nXGBoost saved:")
print("xgboost_landslide.pkl")

print("\nEnsemble configuration saved:")
print("ensemble_config.pkl")


# ============================================================
# 15. FINAL RESULT
# ============================================================

print("\n" + "=" * 60)
print("TRAINING COMPLETED SUCCESSFULLY")
print("=" * 60)

best_model = comparison.loc[
    comparison["ROC-AUC"].idxmax(),
    "Model"
]

print("\nBest model based on ROC-AUC:", best_model)

print("\nNext step:")
print("Connect the trained models to FastAPI.")